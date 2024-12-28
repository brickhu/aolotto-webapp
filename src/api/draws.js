import { message } from "@permaweb/aoconnect"
import { AO } from "../lib/ao"
import { app } from "../signals/global"
let ao = new AO()


export async function fetchDraws([{pool_id,agent_id},{size,cursor}],{refetching}){

  if(!pool_id||!agent_id) return null

  try {
    const query_str =  `
      query{
        transactions(
          recipients: ["${agent_id}"],
          first: ${size||100},
          after: "${cursor?cursor:''}",
          tags: [{
              name: "Data-Protocol",
              values: ["ao"]
            },{
              name: "Variant",
              values: ["ao.TN.1"]
            },{
              name: "Type", 
              values: ["Message"]
            },{
              name: "From-Process",
              values: ["${pool_id}"]
            },{
              name: "Action",
              values: ["Draw-Notice"]
            }]
        ) {
          edges {
            cursor
            node {
              id
              tags {
                name,
                value
              }
              block {
                timestamp,
                height
              }
            }
          }
        }
      }
    `
    const res = await ao.query(query_str)
    let draws
    if(res?.length > 0){
      draws = res.map(({node,cursor})=>{

        const tags = {}
        for (const {name,value} of node.tags) {
          tags[name] = value
        }
 
        return({
          id: node.id,
          archive : tags?.Archive,
          created : tags?.Created,
          jackpot: tags?.Jackpot,
          lucky_number: tags?.['Lucky-Number'],
          denomination: tags?.Denomination,
          ticker: tags?.Ticker,
          token: tags?.Token,
          taxation: tags?.Taxation,
          type : tags?.['Reward-Type'],
          round : tags?.Round,
          winners : tags?.Winners,
          matched : tags?.Matched,
          players : tags?.Players,
          bet: tags?.Bet?.split(","),
          cursor,
          block_height: node.block.height
        })
      })
    }
    return draws
  } catch (error) {
    console.error("fetch draws faild.", error)
    return null
  }
}

export async function fetchDrawsDetail(id){
  try {
    const result = await ao.data(id,{cache:"force-cache"})
    console.log(result)
    return result
  } catch (error) {
    console.error("fetchDrawsDetail faild.", error)
    return null
  }
}