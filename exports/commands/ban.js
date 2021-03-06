module.exports = {
  alias: [
    "ban"
  ],
  activated: true,
  name : "Ban",
  desc : "Bannir eun membre du serveur.",
  schema : "!ban <@> (raison)",
  authorizations : TiCu.Authorizations.getAuth("command", "ban"),
  run : function(params, msg) {
    let crop = new RegExp(/^(!ban\s+[^\s]+\s+)/)
    let target
    if(TiCu.Mention(params[0])) {target = TiCu.Mention(params[0])} else return TiCu.Log.Error("ban", "cible invalide", msg)
    let reason = !!params[1]
    if(reason) {reason = msg.content.substring(msg.content.match(crop)[1].length)}
    msg.reply(`voulez-vous bannir <@${target.id}> du serveur ?\n👌 : Bannir en supprimant les messages des derniers 7j\n👍 : Bannir sans supprimer les messages\n👎 : Annuler`)
      .then(newMsg => {
        newMsg
        .react("👍")
        .then(() => newMsg.react("👎"))
        .then(() => newMsg.react("👌"))
        .then(() => {
          let filter = (reaction, user) => {return (user.id === msg.author.id)}
          newMsg
            .awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] })
            .then(collected => {
              const reaction = collected.firstKey();
              if (reaction === "👍") {
                reason ? target.ban(reason) : target.ban()
                TiCu.Log.Commands.Ban(target, reason, msg)
              } else if (reaction === "👌") {
                reason ? target.ban({days : 7, reason: reason}) : target.ban(7)
                TiCu.Log.Commands.Ban(target, reason, msg)
              } else {
                return TiCu.Log.Error("ban", "annulation", msg)
              }
            })
            .catch(collected => {
              if (!collected) Event.emit("cancelAwait", "ban", target)
            })
        })
      })
  }
}
