import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'x-error-code',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface Question {
  id: string;
  text: string;
  answer: string;
  value: number;
  answered: boolean;
}

interface Category {
  id: string;
  name: string;
  order: number;
  questions: Question[];
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, categories } = await req.json();

    if (!categories || !Array.isArray(categories) || categories.length !== 6) {
      return new Response(
        JSON.stringify({ error: 'Exactly 6 categories are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Game name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedCategories: Category[] = [];

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'Question generation service is not available. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const category of categories) {
      try {
        const prompt = `Generate 5 Jeopardy-style questions for the category "${category.name}". 
        Each question should be formatted as a statement that leads to an answer (like Jeopardy format).
        Make them progressively harder, with values of 200, 400, 600, 800, and 1000 points.
        
        DIFFICULTY LEVEL: Questions should be challenging but attainable for college-educated adults. 
        - 200 points: Moderately challenging - requires general knowledge beyond common facts
        - 400 points: Challenging - requires specific knowledge or connections between concepts
        - 600 points: Difficult - requires deep knowledge or obscure facts in the category
        - 800 points: Very difficult - requires expert-level knowledge or rare trivia
        - 1000 points: Extremely difficult - should stump most players, only experts would know
        
        Avoid overly simple or common knowledge questions. These are for talented trivia players who want a real challenge.
        
        If "${category.name}" is ambiguous, check to see if category name with game ${name} results in better questions.

        Answer to a question should never be the category name.
        
        IMPORTANT: The answer must ALWAYS be in the form of a question starting with "What is" or "Who is" or "Where is" etc.
        This is a core rule of Jeopardy - contestants must respond in question format.
        
        Return ONLY a JSON array with this exact structure:
        [
          {
            "text": "This is the largest planet in our solar system",
            "answer": "What is Jupiter?",
            "value": 200
          },
          {
            "text": "This scientist developed the theory of relativity",
            "answer": "Who is Albert Einstein?",
            "value": 400
          }
        ]
        
        Make sure the questions are interesting, challenging, and appropriate for the category "${category.name}".
        Remember: ALL answers must be in question format with proper punctuation.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert Jeopardy question writer specializing in challenging trivia for college-educated adults. Generate difficult, thought-provoking questions that test deep knowledge and make connections between concepts. Avoid common or trivial facts. All questions must follow proper Jeopardy format (answer as statement, response in question form starting with "What is", "Who is", "Where is", etc.). All answers must end with a question mark. Return only valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API failed with status:', response.status, 'Response:', errorText);
          throw new Error(`OpenAI API request failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response structure from OpenAI API');
        }

        const generatedText = data.choices[0].message.content;
        
        if (!generatedText) {
          throw new Error('Empty response from OpenAI API');
        }
        
        // Clean up the response to extract JSON
        const jsonMatch = generatedText.match(/\[([\s\S]*)\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : generatedText;
        
        let questionsData;
        try {
          questionsData = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response as JSON:', generatedText);
          throw new Error('Invalid JSON response from OpenAI API');
        }
        
        if (!Array.isArray(questionsData) || questionsData.length !== 5) {
          throw new Error('OpenAI API did not return 5 questions as expected');
        }
        
        const questions = questionsData.map((q: any, index: number) => ({
          id: crypto.randomUUID(),
          text: q.text,
          answer: q.answer,
          value: q.value || [200, 400, 600, 800, 1000][index] || 200,
          answered: false
        }));

        generatedCategories.push({
          id: crypto.randomUUID(),
          name: category.name,
          order: category.order,
          questions
        });

        console.log('Successfully generated AI questions for category', category.name);

      } catch (err) {
        console.error('Error generating questions for category', category.name, ':', err);
        return new Response(
          JSON.stringify({ 
            error: `Failed to generate questions for category "${category.name}". Please try again or choose different categories.`,
            details: err instanceof Error ? err.message : 'Unknown error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Log the generated categories to ensure questions are included
    console.log('Generated categories with questions:', JSON.stringify(generatedCategories, null, 2));
    
    // Generate unique slug for the game
    const { data: slug, error: slugError } = await supabase.rpc('generate_unique_slug', { base_name: name });
    
    if (slugError || !slug) {
      console.error('Error generating slug:', slugError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate game identifier' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Save game to database with full category data including questions
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        name,
        slug,
        categories: generatedCategories // Store full categories with questions
      })
      .select()
      .single();
    
    if (gameError) {
      console.error('Error saving game:', gameError);
      return new Response(
        JSON.stringify({ error: 'Failed to save game' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        categories: generatedCategories,
        urlId: slug,
        gameId: gameData.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});