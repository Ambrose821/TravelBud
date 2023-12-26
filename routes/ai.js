var express = require('express');
var router = express.Router();
const openaiClient = require('../openAiClient/openAi')


/* GET home page. */
router.post('/destinations',async (req, res)=> {
    try{
        const preprompt ='Find an Ideal travel destination based on the following criteria. Provide the response in a consistent format with each section immediately following its number and colon, without any line breaks Format the response as: "1: WebLink - [web link here]", "2: Title - [title here]", "3: KeyFeatures - [key features here]", "4: Short description - [short description here]". Here is the prompt: ';

        const user_prompt = req.body.search
        const prompt = preprompt+user_prompt
        console.log(prompt)
        
        const response = await openaiClient.chat.completions.create({
            model: "gpt-4",
            messages:[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}],
            //prompt: prompt,
          
            max_tokens:150
    })
        destination = response.choices[0].message.content
        console.log(destination)
       
        const webLinkRegex = /1: WebLink - \[?(https?:\/\/[^\]\s]+)\]?/;


       
const titleRegex = /2: Title -\s*([^\n]+)/;
const keyFeaturesRegex = /3: KeyFeatures -\s*([^\n]+)/;
const shortDescriptionRegex = /4: Short description -\s*([^\n]+)/;


        const webLinkMatch = destination.match(webLinkRegex);
        const titleMatch = destination.match(titleRegex);
        const keyFeaturesMatch = destination.match(keyFeaturesRegex);
        const shortDescriptionMatch = destination.match(shortDescriptionRegex);

        // Extract the captured groups if the matches are found
        const webLink = webLinkMatch ? webLinkMatch[1] : 'Link Not found';
        const title = titleMatch ? titleMatch[1] : 'Title Not Found';
        const keyFeatures = keyFeaturesMatch ? keyFeaturesMatch[1] : '';
        const shortDescription = shortDescriptionMatch ? shortDescriptionMatch[1] : 'Description Not found';
        console.log(title)
        res.render('results',{destination:destination,
            webLink: webLink,
            title: title,
            keyFeatures: keyFeatures,
            shortDescription: shortDescription},)
    }catch(err){
        console.log(err)
    }
});

module.exports = router;
