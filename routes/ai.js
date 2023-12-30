var express = require('express');
var router = express.Router();
const openaiClient = require('../openAiClient/openAi')

const axios = require('axios')
const cheerio = require('cheerio')

async function getImageUrl(url){
    try{
        const imgResponse = await axios.get(url)
        const html = imgResponse.data;
        const $ = cheerio.load(html)
        const images = $('img')

        if (images.length > 0){
            var imageUrl = $(images[0]).attr('src')
            imageUrl = await getFullUrl(url,imageUrl)
            console.log(url)
            console.log(imageUrl)
            console.log("-----------URL FOUND : ------->"+imageUrl)
            
            return imageUrl;
        }
        else { console.log("No Image"); 
        return null};
    }catch(err){
        console.log("Error Returning Image Url: " +err )
        return null;
    }
}
async function getFullUrl(baseLink, imageUrl){
    if(baseLink.includes('http')){
        return imageUrl
    }
    else{
        if(baseLink.endsWith('/') && imageUrl.Url.startsWith('/')){
            imgaeUrl = imageUrl.substring(1);
        }
        else if(!baseLink.endwith('/') && !imgaeUrl.startsWith('/')){
            imgaeUrl = '/'  + imageUrl;
        }
        return baseLink + imageUrl
    }

}

/* GET home page. */
router.post('/destinations',async (req, res)=> {
    try{
        var preprompt=""
        if(req.body.prev_prompt){
            console.log("+++++++++++++++++++++++++Prev promp:"+ req.body.prev_prompt)
            prev_prompt = req.body.prev_prompt;
             preprompt =`Never deviate from the following format.Find an Ideal travel destination based on the following criteria.This is the useres previous prompt in case they reference it: ${prev_prompt}. Provide the response in a consistent format with each section seperated by a + with no spaces in the following order without any line breaks: WebLink,Title,KeyFeatures,Short description.For Key Feateurs, seperate by a period. If you need to seperate the title section for any reason split it by a period also. Limit the description to 67 words. do not add headings to the sections. use only the sections seperateed by + Here is the prompt: `;
           
        }
        else{ console.log("-----------------No Prev Prompt------------------")
         preprompt ='Never deviate from the following format. Find an Ideal travel destination based on the following criteria. Provide the response in a consistent format with each section seperated by a + with no spaces in the following order without any line breaks: WebLink,Title,KeyFeatures,Short description.For Key Feateurs, seperate by a period. If you need to seperate the title section for any reason split it by a period also. Limit the description to 67 words. do not add headings to the sections. use only the sections seperateed by + Here is the prompt: ';
           
        }
        const user_prompt = req.body.search
        const prompt = preprompt+user_prompt
        console.log(prompt)
        
        const response = await openaiClient.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages:[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}],
            //prompt: prompt,
          
            max_tokens:150
    })
        destination = response.choices[0].message.content
        console.log(destination)
       
        const content_arr = destination.split('+');


        // Extract the captured groups if the matches are found
        const webLink = content_arr[0]
        const title = content_arr[1]
        const keyFeatures = content_arr[2]
        const shortDescription = content_arr[3]

        //Split Key Featurs by period
        const features = keyFeatures.split('.')
        var featureString = '';
        features.forEach(element => {
            featureString =  featureString + element + ', ';
        });
        featureString = "Key Features: "  +featureString

        //get sample image
        const imageUrl = await getImageUrl(webLink);
        console.log(imageUrl)
        res.render('results',{destination:destination,
            webLink: webLink,
            title: title,
            keyFeatures: featureString,
            shortDescription: shortDescription,
            imageUrl: imageUrl,
        prev_prompt:prompt},
          )
    }catch(err){
        console.log(err)
    }
});

module.exports = router;
