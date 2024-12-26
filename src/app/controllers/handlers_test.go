package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var testRouter *gin.Engine

func setupTestDB(t *testing.T) func() {
	// Connect to test database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		t.Fatal(err)
	}

	// Use a test database
	collection = client.Database("employee_test_db").Collection("employees")

	// Clear the test collection
	collection.DeleteMany(ctx, bson.M{})

	// Return cleanup function
	return func() {
		collection.DeleteMany(ctx, bson.M{})
		client.Disconnect(ctx)
	}
}

func TestMain(m *testing.M) {
	// Set Gin to Test Mode
	gin.SetMode(gin.TestMode)

	// Setup the router
	testRouter = gin.Default()
	testRouter.GET("/employees", getEmployees)
	testRouter.GET("/employees/:id", getEmployee)
	testRouter.POST("/employees", createEmployee)
	testRouter.PUT("/employees/:id", updateEmployee)
	testRouter.DELETE("/employees/:id", deleteEmployee)

	// Run tests
	m.Run()
}

func TestCreateEmployee(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Test employee data
	employee := Employee{
		FirstName:  "John",
		LastName:   "Doe",
		Email:     "john.doe@example.com",
		Phone:     "1234567890",
		Position:  "Developer",
		Department: "Engineering",
		HireDate:  time.Now(),
	}

	// Convert to JSON
	jsonValue, _ := json.Marshal(employee)

	// Create request
	req := httptest.NewRequest("POST", "/employees", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Serve request
	testRouter.ServeHTTP(w, req)

	// Assert status code
	if w.Code != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
	}

	// Parse response
	var response Employee
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatal(err)
	}

	// Assert employee data
	if response.FirstName != employee.FirstName {
		t.Errorf("Expected FirstName %s, got %s", employee.FirstName, response.FirstName)
	}
}

func TestGetEmployees(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Insert test employee
	employee := Employee{
		FirstName:  "Jane",
		LastName:   "Smith",
		Email:     "jane.smith@example.com",
		Phone:     "0987654321",
		Position:  "Manager",
		Department: "HR",
		HireDate:  time.Now(),
	}

	ctx := context.Background()
	collection.InsertOne(ctx, employee)

	// Create request
	req := httptest.NewRequest("GET", "/employees", nil)
	w := httptest.NewRecorder()

	// Serve request
	testRouter.ServeHTTP(w, req)

	// Assert status code
	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	// Parse response
	var employees []Employee
	err := json.Unmarshal(w.Body.Bytes(), &employees)
	if err != nil {
		t.Fatal(err)
	}

	// Assert we got at least one employee
	if len(employees) == 0 {
		t.Error("Expected at least one employee, got none")
	}
}

func TestUpdateEmployee(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Insert test employee
	ctx := context.Background()
	employee := Employee{
		FirstName:  "Original",
		LastName:   "Name",
		Email:     "original@example.com",
		Phone:     "1234567890",
		Position:  "Developer",
		Department: "Engineering",
		HireDate:  time.Now(),
	}

	result, _ := collection.InsertOne(ctx, employee)
	id := result.InsertedID.(primitive.ObjectID).Hex()

	// Updated data
	employee.FirstName = "Updated"
	jsonValue, _ := json.Marshal(employee)

	// Create request
	req := httptest.NewRequest("PUT", "/employees/"+id, bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Serve request
	testRouter.ServeHTTP(w, req)

	// Assert status code
	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	// Verify update in database
	var updatedEmployee Employee
	collection.FindOne(ctx, bson.M{"_id": id}).Decode(&updatedEmployee)
	if updatedEmployee.FirstName != "Updated" {
		t.Errorf("Expected FirstName %s, got %s", "Updated", updatedEmployee.FirstName)
	}
}

func TestDeleteEmployee(t *testing.T) {
	cleanup := setupTestDB(t)
	defer cleanup()

	// Insert test employee
	ctx := context.Background()
	employee := Employee{
		FirstName:  "ToDelete",
		LastName:   "User",
		Email:     "delete@example.com",
		Phone:     "1234567890",
		Position:  "Developer",
		Department: "Engineering",
		HireDate:  time.Now(),
	}

	result, _ := collection.InsertOne(ctx, employee)
	id := result.InsertedID.(primitive.ObjectID).Hex()

	// Create request
	req := httptest.NewRequest("DELETE", "/employees/"+id, nil)
	w := httptest.NewRecorder()

	// Serve request
	testRouter.ServeHTTP(w, req)

	// Assert status code
	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	// Verify deletion
	count, _ := collection.CountDocuments(ctx, bson.M{"_id": id})
	if count != 0 {
		t.Error("Employee was not deleted")
	}
}