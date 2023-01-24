const axios = require('axios')
const fs = require('fs')

async function sleep(sec){
    return new Promise(resolve => setTimeout(() => resolve(), sec*1000))
}

async function fetchBalance(wallet){
    return axios.get('https://api.debank.com/user/total_balance', {
            params: {
                'addr': wallet
            },
            headers: {
                'authority': 'api.debank.com',
                'accept': '*/*',
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'origin': 'https://debank.com',
                'referer': 'https://debank.com/',
                'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'source': 'web',
                'x-api-ver': 'v2'
            }
    });
}


async function main(){
    fs.writeFileSync('logs.txt', '')

    const wallets = fs.readFileSync('wallets.txt', 'utf8').split('\r\n')

    const Promises = []
    const accountsData = []

    for (let [index, wallet] of wallets.entries()){
        if(index % 5 === 0 && index !=0){
            await sleep(3)
        }

        console.log(index)

        Promises.push(new Promise(async resolve => {
            const balance = await fetchBalance(wallet)
                .then(res => res.data.data.total_usd_value)
                .then(balance => parseFloat(balance.toFixed(2)))

            accountsData.push({
                wallet: wallet,
                balance: balance,
            })
            resolve()
        }))

    }
    await Promise.all(Promises)

    accountsData.sort((a, b) => {
        if(a.balance < b.balance){
            return 1
        }
        if(a.balance > b.balance){
            return -1
        }
        else return 0
    })

    let totalBalance = 0

    for (let i of accountsData){
        fs.appendFileSync('logs.txt', `${i.wallet} $${i.balance}\n`)
        totalBalance += i.balance
    }

    fs.appendFileSync('logs.txt', `\ntotal balance: ${totalBalance}`)
}

main()