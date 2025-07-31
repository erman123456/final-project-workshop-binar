// We need to mock 'dotenv' and 'fs' modules as they interact with the file system
// and environment variables, which we want to control during testing.
import { writeFileSync } from 'fs';
import { GoogleGenAI } from "@google/genai";

// Mock the 'dotenv' module to prevent it from actually loading .env files during tests.
// This ensures that our tests are isolated and don't depend on external files.
jest.mock('dotenv', () => ({
  config: jest.fn(), // Mock the config function
}));

// Mock the 'fs' module, specifically 'writeFileSync', to prevent actual file writing.
// We can then assert if writeFileSync was called with the correct arguments.
jest.mock('fs', () => ({
  writeFileSync: jest.fn(), // Mock writeFileSync
}));

// Mock the '@google/genai' module to control the behavior of the AI API calls.
// This allows us to simulate successful responses and errors without making actual network requests.
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          // Mock the generateContent method to return a predictable response.
          // This can be chained with .mockResolvedValueOnce() for specific test cases.
          generateContent: jest.fn().mockResolvedValue({
            text: 'Mocked AI response',
            candidates: [{
              content: {
                parts: [{ text: 'Mocked AI response' }]
              }
            }]
          }),
        },
      };
    }),
  };
});

// Import the main application logic after all mocks are set up.
// This ensures that the mocked versions of the modules are used.
// We need to import the functions directly if they are exported, or require the file
// if they are not explicitly exported but defined globally or within a module.
// Assuming your functions are in a file like 'app.js' or similar.
// For this example, let's assume the functions are in a file named 'main.js'
// and we are testing them by importing the file which runs the main function.
// If your functions are not exported, you might need to adjust your main.js
// to export them for testing, or use a different approach like directly calling them
// after requiring the module.
// For simplicity, let's assume `googleGenAIExecute` and `main` are accessible.
// If they are not exported, you might need to refactor your original code to export them.
// For this test, we'll assume they are exported or made available for testing.
// Since the original code is a script that runs `main()` directly, we'll need to
// adjust how we test it. A common pattern is to wrap the main logic in an exported
// function or class.
// Let's assume the functions are now exported from a file named 'your-app-file.js'
// For the purpose of this test, we'll recreate the functions locally for testing.

// Re-declaring the functions from your original code for testing purposes,
// assuming they would be exported from a module in a real scenario.
const API_KEY = process.env.API_KEY || 'test-api-key'; // Use a test API key for consistency

async function googleGenAIExecute(content) {
  // console.log('Sending content to Google GenAI for analysis...'); // Comment out console.logs for cleaner test output
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      }
    });
    // console.log('Received response from Google GenAI.', response.text); // Comment out console.logs
    return response.candidates[0].content.parts[0].text; // Access the text directly
  } catch (error) {
    // console.error('Error analyzing log with GenAI:', error.message); // Comment out console.logs
    throw new Error(`Failed to get analysis from GenAI: ${error.message}`);
  }
}

async function main() {
  try {
    const analysis = await googleGenAIExecute("create new project nestjs and typescript with project name company profile which is the response only bash script");
    const response = await googleGenAIExecute(analysis + 'convert the response to javascript code and can be executed in nodejs environment and remove ');

    const filePath = 'setup.js';
    writeFileSync(filePath, response, 'utf8');
  } catch (error) {
    // console.error('An error occurred during the process:', error.message); // Comment out console.logs
    throw error; // Re-throw error to be caught by test framework
  }
}


// Describe block for the entire test suite.
describe('Google GenAI Integration', () => {
  // Before each test, reset all mocks to their initial state.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for the googleGenAIExecute function.
  describe('googleGenAIExecute', () => {
    // Test case for successful API call.
    test('should return analysis content on successful API call', async () => {
      // Set a specific mock resolved value for this test case.
      GoogleGenAI.mockImplementationOnce(() => {
        return {
          models: {
            generateContent: jest.fn().mockResolvedValue({
              candidates: [{
                content: {
                  parts: [{ text: 'Successful analysis result' }]
                }
              }]
            }),
          },
        };
      });

      const content = "test log content";
      const result = await googleGenAIExecute(content);

      // Assert that GoogleGenAI was instantiated.
      expect(GoogleGenAI).toHaveBeenCalledTimes(1);
      // Assert that generateContent was called with the correct arguments.
      expect(GoogleGenAI().models.generateContent).toHaveBeenCalledWith({
        model: "gemini-2.5-flash",
        contents: content,
        config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        }
      });
      // Assert that the function returned the expected result.
      expect(result).toBe('Successful analysis result');
    });

    // Test case for API call failure.
    test('should throw an error if API call fails', async () => {
      // Set the mock to reject with an error for this test case.
      GoogleGenAI.mockImplementationOnce(() => {
        return {
          models: {
            generateContent: jest.fn().mockRejectedValue(new Error('API error')),
          },
        };
      });

      const content = "test log content";

      // Assert that the function throws an error.
      await expect(googleGenAIExecute(content)).rejects.toThrow('Failed to get analysis from GenAI: API error');
    });
  });

  // Test suite for the main function.
  describe('main', () => {
    // Test case for successful execution of the main function.
    test('should successfully analyze and write file', async () => {
      // Mock the responses for the two calls to googleGenAIExecute within main.
      // The first call will return 'bash script', and the second will return 'javascript code'.
      GoogleGenAI.mockImplementation(() => {
        const mockGenerateContent = jest.fn();
        mockGenerateContent
          .mockResolvedValueOnce({
            candidates: [{
              content: {
                parts: [{ text: 'bash script' }]
              }
            }]
          }) // First call in main
          .mockResolvedValueOnce({
            candidates: [{
              content: {
                parts: [{ text: 'javascript code' }]
              }
            }]
          }); // Second call in main
        return {
          models: {
            generateContent: mockGenerateContent,
          },
        };
      });

      await main();

      // Assert that googleGenAIExecute was called twice.
      expect(GoogleGenAI().models.generateContent).toHaveBeenCalledTimes(2);
      // Assert that writeFileSync was called with the correct file path and content.
      expect(writeFileSync).toHaveBeenCalledTimes(1);
      expect(writeFileSync).toHaveBeenCalledWith('setup.js', 'javascript code', 'utf8');
    });

    // Test case for error handling in the main function.
    test('should throw an error if googleGenAIExecute fails in main', async () => {
      // Mock the first call to googleGenAIExecute to reject with an error.
      GoogleGenAI.mockImplementationOnce(() => {
        return {
          models: {
            generateContent: jest.fn().mockRejectedValue(new Error('First API call failed')),
          },
        };
      });

      // Assert that the main function throws an error.
      await expect(main()).rejects.toThrow('Failed to get analysis from GenAI: First API call failed');
      // Assert that writeFileSync was not called if an error occurred early.
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });
});
