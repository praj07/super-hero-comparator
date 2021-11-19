
export function stylizeSingleHeroFound(existingHero: any) {
    const imageUrl = existingHero.image.url;
    const heroName = existingHero.name;
    return {
        'blocks': [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `I was only able to find ${heroName}, so they win this fight!`
			}
		},
		{
			"type": "image",
			"title": {
				"type": "plain_text",
				"text": "The undisputed strongest",
				"emoji": true
			},
			"image_url": imageUrl,
            "alt_text": heroName
		}]
    }
}
export function stylizeNoHeroesFound(firstHeroName: string, secondHeroName: string) {
    return {
        "blocks": [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `I was unable to find heroes *${firstHeroName}* and *${secondHeroName}*`
            }
        }]
    }
};

/**
 * let the heros duke it out and see who the winner would be
 * @param firstHeroData 
 * @param secondHeroData 
 * @param winnerMap 
 * @param runningCount 
 * @returns 
 */
export function stylizeResponseBothHeros(firstHeroData: any, secondHeroData: any, winnerMap: any, runningCount: number) {
    const winner = runningCount > 0 ? firstHeroData.name : secondHeroData.name;
    const winningFields = [];

    for(const stat in winnerMap) {
        if (winnerMap[stat] === winner)
        winningFields.push(stat)
    };

    return {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "BATTLE OF THE CENTURY",
                    "emoji": true
                }
            },
            ...generateHeroProfile(firstHeroData),
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "VS",
                    "emoji": true
                }
            },
            ...generateHeroProfile(secondHeroData),
            {
                "type": "divider"
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Conclusion",
                    "emoji": true
                }
            },
            {
               "type": "section",
			    "text": {
                    "type": "mrkdwn",
                    "text": runningCount === 0 ? 
                        `*${firstHeroData.name}* and *${secondHeroData.name}* are equally matched!` :
                        `*${winner}* wins in ${winningFields.length} stats (${winningFields.join(', ')}) thus they are the better hero`
                }
            }
        ]
    }
}

/**
 * generates the heros profile, including name, a picture and their powerstats
 * @param heroData 
 * @returns 
 */
function generateHeroProfile(heroData: any) {
    return [
    {
        "type": "image",
        "image_url": `${heroData.image.url}`,
        "alt_text": `${heroData.name}`
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `*${heroData.name} (${heroData.biography['full-name']})*`
        }
    },
    {
        "type": "section",
        "fields": generatePowerstatBlocks(heroData.powerstats)
    }];
}

/**
 * generates an array of text fields which correspond to the characters powerstats
 * @param powerStats  
 * @returns 
 */
function generatePowerstatBlocks(powerStats: any): {
    type: string,
    text: string
}[] {
    const fields: {
            type: string,
            text: string
        }[] = [] 
    for (const stat in powerStats) {
        fields.push({
            type: 'mrkdwn',
            text: `${stat}: ${powerStats[stat]}`
        });
    };

    return fields
} 