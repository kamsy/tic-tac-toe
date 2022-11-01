const { REACT_APP_SAVED_GAMES_KEY } = process.env;

const AppConfig = {
  savedGamesKey: REACT_APP_SAVED_GAMES_KEY || "",
};

export default AppConfig;
