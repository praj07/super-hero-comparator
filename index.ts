import dotenv from 'dotenv';
dotenv.config();

import _ from 'lodash';
import { stylizeSingleHeroFound, stylizeNoHeroesFound, stylizeResponseBothHeros } from './methods/stylizations';

import { getSuperHeroData  } from './methods/SuperHero';


// exports.handler = async (event: any) => {
const main = async (event: any) => {

    // first thing, get the two superheros who are competing
    const firstHeroData = await getSuperHeroData(event['queryStringParameters']['firstHeroName'])
    const secondHeroData =await getSuperHeroData(event['queryStringParameters']['secondHeroName']);

    // TODO: definitely type the Axios response
    const secondHeroResults: any = await getHeroData(secondHeroName);
 
    let secondHeroData: any = secondHeroResults.data.results? secondHeroResults.data.results[0] : undefined

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

        console.log(winnerMap)
        
        responseBlockKit = stylizeResponseBothHeros(firstHeroData, secondHeroData, winnerMap, runningCount);
    } else if (_.isUndefined(firstHeroData) && _.isUndefined(secondHeroData)){
        // if both don't exist, fizzle,
        responseBlockKit = stylizeNoHeroesFound(firstHeroName, secondHeroName);
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



/**
 * creates a comparison map to find which hero wins in all specific power stat categories
 * @param firstHeroData 
 * @param secondHeroData 
 * @returns 
 */
function comparePowerStats(firstHeroData: any, secondHeroData: any) {
    const winnerMap: {
        [powerStat: string]: string
    } = {};
    let runningCount = 0;
    for (const stat in firstHeroData.powerstats) {
        const firstHeroStat = parseInt(firstHeroData.powerstats[stat]);
        const secondHeroStat = parseInt(secondHeroData.powerstats[stat]);
        // we'll use this to keep track of which hero wins more of the stats
        // -ve means hero 2 wins, +ve means hero 1 wins
        console.log(stat, 'first: ', firstHeroStat, '     second: ', secondHeroStat)
        if (firstHeroStat === secondHeroStat) {
            winnerMap[stat] = 'tie'
        } else {
            if (firstHeroStat > secondHeroStat ) {
                winnerMap[stat] = firstHeroData.heroName;
                runningCount++;
            } else {
                winnerMap[stat] = secondHeroData.heroName;
                runningCount--;
            }
        }
    };
    return {
        winnerMap,
        runningCount
    }

}

// For Testing
main({
    queryStringParameters: {
        firstHeroName: 'abraxas',
        secondHeroName: 'abomination'
    },
});



