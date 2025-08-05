#!/usr/bin/env node

/**
 * Test script to demonstrate the port conflict fix
 * Run this to simulate multiple project generation requests
 */

const axios = require("axios");

const BACKEND_URL = "http://localhost:3000"; // Adjust if your backend runs on different port

async function testMultipleProjects() {
  console.log("🧪 Testing Multiple Frontend Project Generation");
  console.log("============================================\n");

  const testProjects = [
    { name: "Tech Company Profile", type: "company-profile" },
    { name: "Product Landing Page", type: "landing-page" },
    { name: "Online Electronics Store", type: "ecommerce" },
    { name: "Basic Portfolio Site", type: "basic" },
  ];

  console.log(`📋 Will generate ${testProjects.length} projects:`);
  testProjects.forEach((project, index) => {
    console.log(`   ${index + 1}. ${project.name} (expected: ${project.type})`);
  });
  console.log();

  for (let i = 0; i < testProjects.length; i++) {
    const project = testProjects[i];

    try {
      console.log(
        `\n🚀 Generating project ${i + 1}/${testProjects.length}: "${
          project.name
        }"`
      );
      console.log("─".repeat(50));

      const startTime = Date.now();

      const response = await axios.post(
        `${BACKEND_URL}/generate-frontend/vanilla`,
        {
          projectName: project.name,
        },
        {
          timeout: 60000, // 60 seconds timeout
        }
      );

      const duration = Date.now() - startTime;

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ SUCCESS: "${project.name}" generated in ${duration}ms`);
        console.log(`   Expected type: ${project.type}`);
        console.log(`   Status: ${response.status}`);
      } else {
        console.log(`⚠️  UNEXPECTED STATUS: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ FAILED: "${project.name}"`);

      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(
          `   Error: ${error.response.data?.message || error.response.data}`
        );

        // Check if it's the old port conflict error
        if (
          error.response.status === 400 &&
          error.response.data?.message?.includes(
            "Server process exited with code 1"
          )
        ) {
          console.log("   🔍 This looks like the old port conflict issue!");
        }
      } else if (error.code === "ECONNREFUSED") {
        console.log("   🔌 Backend server is not running");
        console.log("   💡 Please start the backend server first");
        break;
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }

    // Wait between requests to see results clearly
    if (i < testProjects.length - 1) {
      console.log("\n⏳ Waiting 2 seconds before next project...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n🏁 Test completed!");
  console.log("\n📊 Summary:");
  console.log(
    "   - If all projects succeeded: Port conflict fix is working! ✅"
  );
  console.log(
    "   - If 2nd+ projects failed with code 400: Port conflict still exists ❌"
  );
  console.log("   - Check the generated projects in the output/ directory");
  console.log(
    "   - Each project should be running on a different port (8080, 8081, etc.)"
  );
}

async function checkBackendStatus() {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 5000,
    });
    console.log("✅ Backend server is running");
    return true;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("❌ Backend server is not running");
      console.log("💡 Please start the backend server with: npm run start:dev");
    } else {
      console.log("⚠️  Backend health check failed:", error.message);
    }
    return false;
  }
}

// Main execution
async function main() {
  console.log("🔍 Checking backend server status...");

  const isBackendRunning = await checkBackendStatus();

  if (!isBackendRunning) {
    console.log("\n❌ Cannot run tests without backend server");
    process.exit(1);
  }

  console.log("\n");
  await testMultipleProjects();
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("\n💥 Unhandled error:", error.message);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMultipleProjects, checkBackendStatus };
