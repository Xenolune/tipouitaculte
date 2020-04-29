module.exports = {
  alias: [
    "bienvenue"
  ],
  activated: true,
  name : "Bienvenue",
  desc : "Accorder le rôle Phosphate à eun membre.",
  schema : "!bienvenue <@>",
  authorizations : TiCu.Authorizations.getAuth("command", "bienvenue"),
  run : function(params, msg) {
    if (params.length < 1) {
      return TiCu.Commands.help.run([this.alias[0]], msg)
    }
    let target
    if(TiCu.Mention(params[0])) {target = TiCu.Mention(params[0])} else return TiCu.Log.Error("bienvenue", "cible invalide", msg)
    if(!target.roles.find(e => e.id === PUB.roles.phosphate.id)) {
      target.addRole(PUB.roles.phosphate.id)
      TiCu.Log.Commands.Bienvenue(target, msg)
    } else return TiCu.Log.Error("bienvenue", "cible déjà phosphate", msg)
  }
}
