import OpenAI from "openai";

const USE_MOCK = true;

function mockOpenAIClient() {
  return {
    images: {
      generate: async () => {
        // sleep for 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return {
          data: [
            {
              url: "https://d3flt886hm4b5c.cloudfront.net/logos/c3b42d09-bab7-43fc-9427-2d4bc8976f8a.png",
            },
          ],
        };
      },
    },
  };
}

export function getOpenAIClient() {
  if (USE_MOCK) {
    return mockOpenAIClient();
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return openai;
}
