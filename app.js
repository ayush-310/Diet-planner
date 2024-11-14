// app.js
const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { marked } = require("marked");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Sample exercise recommendations based on days
const exerciseRecommendations = {
    3: [
        { name: "Push-Ups", sets: "3 sets", timing: "10-15 reps", img: "/images/pushups.jpg" },
        { name: "Squats", sets: "3 sets", timing: "15 reps", img: "/images/squats.jpg" },
    ],
    4: [
        { name: "Pull-Ups", sets: "3 sets", timing: "8-12 reps", img: "/images/pullups.jpg" },
        { name: "Lunges", sets: "3 sets", timing: "12 reps each leg", img: "/images/lunges.jpg" },
    ],
    5: [
        { name: "Burpees", sets: "4 sets", timing: "12 reps", img: "/images/burpees.jpg" },
        { name: "Plank", sets: "3 sets", timing: "1 min hold", img: "/images/plank.jpg" },
    ]
};

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/get-diet-plan", (req, res) => {
    res.render("form");
});

app.post("/generate-diet-plan", async (req, res) => {
    const { age, weight, height, diet, schedule, exercise } = req.body;

    const prompt = `
    Create a sample diet plan for a ${age}-year-old individual with the following details:
    - Weight: ${weight} kg
    - Height: ${height} cm
    - Diet preference: ${diet}
    - Schedule: ${schedule}
    - Ability to exercise ${exercise} days per week

    Please include meal suggestions for breakfast, lunch, dinner, and snacks, tailored to their dietary preferences. Make the plan simple and achievable, focusing on balanced nutrition.
  `;

    try {
        const result = await model.generateContent(prompt);
        const dietPlanMarkdown = result.response.text();
        const dietPlanHtml = marked(dietPlanMarkdown);
        const exercises = exerciseRecommendations[exercise];

        res.render("result", { dietPlanHtml, exercises });
    } catch (error) {
        console.error("Error generating diet plan:", error);
        res.send("An error occurred while generating your diet plan.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
