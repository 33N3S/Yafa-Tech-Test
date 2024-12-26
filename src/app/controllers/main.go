package main

import (
	"context"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Employee struct {
	ID         string    `json:"id" bson:"_id,omitempty"`
	FirstName  string    `json:"firstName" binding:"required"`
	LastName   string    `json:"lastName" binding:"required"`
	Email      string    `json:"email" binding:"required,email"`
	Phone      string    `json:"phone" binding:"required"`
	Position   string    `json:"position" binding:"required"`
	Department string    `json:"department" binding:"required"`
	HireDate   time.Time `json:"hireDate" binding:"required"`
}

var collection *mongo.Collection

func main() {
	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}

	collection = client.Database("employee_db").Collection("employees")

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

    // Public routes
    router.POST("/login", login)

    // Protected routes
    protected := router.Group("/api")
    protected.Use(AuthMiddleware())
    {
        protected.GET("/employees", getEmployees)
        protected.GET("/employees/:id", getEmployee)
        protected.POST("/employees", createEmployee)
        protected.PUT("/employees/:id", updateEmployee)
        protected.DELETE("/employees/:id", deleteEmployee)
    }

	router.Run(":8080")
}
