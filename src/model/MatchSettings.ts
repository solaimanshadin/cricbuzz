class MatchSetting implements MatchSettingsType {
  public playerPerTeam;
  public noBallReBall;
  public wideReBall;
  public noBallRun;
  public wideRun;

  constructor() {
    const data = localStorage.getItem("matchSettings");
    const {
      playerPerTeam = 11,
      noBallReBall = true,
      wideReBall = true,
      noBallRun = 1,
      wideRun = 1,
    } = JSON.parse(data || '{}');

    this.playerPerTeam = playerPerTeam;
    this.noBallReBall = noBallReBall;
    this.wideReBall = wideReBall;
    this.noBallRun = noBallRun;
    this.wideRun = wideRun;
  }

  updateSettings(payload: MatchSettingsType): void {
    Object.keys(payload).forEach((property) => {
      
      this[property as keyof MatchSettingsType] = payload[property as keyof MatchSettingsType];
    });
    
    localStorage.setItem("matchSettings", JSON.stringify(this))
  }
}

export default new MatchSetting();
