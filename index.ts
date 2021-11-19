import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

import _ from 'lodash';
import { stylizeSingleHeroFound, stylizeNoHeroesFound, stylizeResponseBothHeros } from './methods/stylizations';

import { getSuperHeroData, comparePowerStats } from './methods/SuperHero';


exports.handler = async (event: any) => {
// const main = async (event: any) => { // for testing

    // first thing, get the two superheros who are competing
    const firstHeroQuery = event['queryStringParameters']['firstHeroName']
    const secondHeroQuery = event['queryStringParameters']['secondHeroName']


    const firstHeroData = await getSuperHeroData(firstHeroQuery)
    const secondHeroData =await getSuperHeroData(secondHeroQuery);

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
    }) 
};

// For Testing
// main({
//     queryStringParameters: {
//         firstHeroName: 'abraxas',
//         secondHeroName: 'abomination'
//     },
// });



