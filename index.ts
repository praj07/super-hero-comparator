import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

import _ from 'lodash';
import { stylizeSingleHeroFound, stylizeNoHeroesFound, stylizeResponseBothHeros } from './methods/stylizations';

import { getSuperHeroData, comparePowerStats } from './methods/SuperHero';


exports.handler = async (event: any, context: any, callback: any) => {


    /******* Structure of Event Data coming from API Gateway ********/
    /*
    event = {
        ...
        "body": {
            "challenge": "xxxx",
            "token": "ZZZZZZWSxiZZZ2yIvs3peJ",
            "team_id": "T061EG9R6",
            "api_app_id": "A0MDYCDME",
            "event": {
                "type": "app_mention",
                "user": "W021FGA1Z",
                "text": "<@U0LAN0Z89> Superman vs Batman",
                "ts": "1515449483.000108",
                "channel": "C0LAN2Q65",
                "event_ts": "1515449483000108"
            },
            "type": "event_callback",
            "event_id": "Ev0MDYHUEL",
            "event_time": 1515449483000108,
            "authed_users": [
                "U0LAN0Z89"
            ]
        },
        "resource": "/{proxy+}",
       ...
    }
    */

    const eventObject = typeof event === 'string' ? JSON.parse(event) : event;

    const bodyObject = typeof eventObject.body === 'string' ? JSON.parse(eventObject.body) : eventObject.body
    // handle challenge if its ever called

    const challenge = bodyObject["challenge"];
    if (!_.isUndefined(challenge)) {
        callback(null,
        {
            statusCode: 200, 
            body: JSON.stringify({
                challenge
            })
        });
        return;
    }

    // first thing, get the two superheros who are competing

    // SAMPLE data from slack
    // {
    //     "type": "app_mention",
    //     "user": "U061F7AUR",
    //     "text": "<@raj> batman v spiderman",
    //     "ts": "1515449522.000016",
    //     "channel": "C0LAN2Q65",
    //     "event_ts": "1515449522000016"
    // }
    const messageToParse: string[] = bodyObject.event["text"].split(' ');

    const firstHeroQuery = messageToParse[1];
    const secondHeroQuery = messageToParse[3];


    const firstHeroData = await getSuperHeroData(firstHeroQuery)
    const secondHeroData = await getSuperHeroData(secondHeroQuery);

    // The stylized response from block kit
    let responseBlockKit = {};
    if (!_.isUndefined(firstHeroData) && !_.isUndefined(secondHeroData)) {
         // if both exist, deathmatch
        const firstHeroPowerStats = firstHeroData.powerstats;
        const firstHeroFoundName = firstHeroData.name;

        const secondHeroPowerStats = secondHeroData.powerstats;
        const secondHeroFoundName = secondHeroData.name;
        
        const { winnerMap, runningCount } = comparePowerStats({
            powerstats: firstHeroPowerStats,
            heroName: firstHeroFoundName
        }, {
            powerstats: secondHeroPowerStats,
            heroName: secondHeroFoundName    
        });
        
        responseBlockKit = stylizeResponseBothHeros(firstHeroData, secondHeroData, winnerMap, runningCount);

    } else if (_.isUndefined(firstHeroData) && _.isUndefined(secondHeroData)){
        // if both don't exist, fizzle,
        responseBlockKit = stylizeNoHeroesFound(firstHeroQuery, secondHeroQuery);
    } else {
        // if one exists but not the other, that hero wins
        const existingHero = !_.isUndefined(firstHeroData) ? firstHeroData : secondHeroData

        responseBlockKit = stylizeSingleHeroFound(existingHero);
    }
    await axios({
        method: 'POST',
        url: process.env.SLACK_URL,
        data: responseBlockKit,
        headers: {
           'Content-Type': 'application/json',
        } 
    });

    callback(null,
        {
            statusCode: 200, 
            body: JSON.stringify({
                isSuccess: true
            })
        }
    );
    return
};

// // For Testing
// exports.handler(JSON.stringify({
//     body: {
//         text: '@raj cyborg vs superman'
//     }
// }), null , (a: any, b: any) => {
//     console.log(b)
// });



