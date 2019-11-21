const fs = require("fs")
let votesFile = "/media/usb/nodejs/tipouitaculte/private/votes.json"
module.exports = function(params, msg) {
  return {
    authorizations : {
      chans : {
        type: "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
    },
      channels : "Tous (public ou anon) ou Automodération/Salle des Votes (anon+kick/ban) ou Salle des Votes (anon+turquoise)",
      authors : "Tous",
      roleNames : "Tous",
      schema : "!vote <anon|anonyme> <turquoise|kick|ban> <@tag|ID>\nou\n!vote <anon|anonyme> <texte> (texte)\nou\n!vote (texte)"
    },
    run : function(params, msg) {
      let crop, target
      let anon = (params[0] === "anon" || params[0] === "anonyme") ? true : false
      let type = params[1]
      if(anon){
        if(type === "kick" || type === "ban") {
          /* if(msg.channel.id === PUB.tipoui.salleDesVotes || msg.channel.id === PUB.tipoui.automoderation) { */
          if(msg.channel.id === PUB.debug.botsecret) {
            if(params[2]) {target = TiCu.Mention(params[2])}
            else { return TiCu.Log.Error("vote", "les votes de kick et de ban nécessitent une cible")}
          } else {return TiCu.Log.Error("vote", "les votes de kick et de ban sont restreints aux salons <#" + PUB.tipoui.automoderation + "> et <#" + PUB.tipoui.salleDesVotes +">", msg)}
        } else if(type === "turquoise") {
          if(msg.channel.id === PUB.tipoui.salleDesVotes) {
            if(params[2]) {target = TiCu.Mention(params[2])}
            else { return TiCu.Log.Error("vote", "les votes de passage Turquoise nécessitent une cible")}
          } else {return TiCu.Log.Error("vote", "les votes de passage Turquoise sont restreints au salon <#" + PUB.tipoui.salleDesVotes + ">", msg)}
        } else if(type != "text") {return TiCu.Log.Error("vote", "quel type de vote ?", msg)}
        if(typeof target != "object" && type != "text") {return TiCu.Log.Error("vote", "cible invalide")}
        crop = new RegExp(/^!vote\s+[^\s]+\s+/)
        if(!msg.content.match(crop)) {return TiCu.Log.Error("vote", "il manque des paramètres", msg)}
        msg.channel.send(msg.content.substring(msg.content.match(crop)[0].length))
          .then(newMsg => {
            let json = {"action": "write", "content" :{}}
            json.target = votesFile
            json.content[newMsg.id] = {}
            json.content[newMsg.id].date = TiCu.Date("fr")
            json.content[newMsg.id].chan = newMsg.channel.id
            json.content[newMsg.id].type = type
            if(target) {json.content[newMsg.id].target = target.id}
            json.content[newMsg.id].votes = {"oui":[], "non":[], "blanc":[], "délai":[]}
            if(TiCu.json(json)) {
              newMsg.react("✅")
                .then(async function() {
                  await newMsg.react("⚪")
                  await newMsg.react("🛑")
                  await newMsg.react("⏱")
                })
              TiCu.VoteCollections.Init(type, ["✅","⚪","🛑","⏱"], newMsg)
              TiCu.Log.Prefixed.Vote.Anon(type, params, newMsg, msg)
            } else TiCu.Log.Error("vote", "erreur d'enregistrement du vote", msg)
          })
      } else if(msg.channel.id === PUB.tipoui.salleDesVotes) {return TiCu.Log.Error("vote", "seuls les votes anonymisés sont autorisés dans <#" + PUB.tipoui.salleDesVotes + ">")}
      else {
        msg.react("✅").then(async function() {
          await msg.react("⚪")
          await msg.react("🛑")
          await msg.react("⏱")
        })
        TiCu.Log.Prefixed.Vote.Public(msg)
      }
    }
  }
}
