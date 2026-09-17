// Catálogo de times por preset: só pros formatos ligados a uma liga real
// específica (Brasileirão, Premier League, Bundesliga) - faz sentido
// escolher entre os clubes daquela liga. Mata-mata simples e Champions
// League (que reúne times de várias ligas diferentes) continuam com nome
// livre. Nomes e cores de camisa são fatos públicos, não reproduzem
// nenhum escudo/logo oficial - a cor aqui é só um valor inicial sugerido
// pro seletor de cor que já existia, o jogador pode trocar à vontade.
export interface CatalogClub {
  name: string
  color: string
}

export const TEAM_CATALOG: Partial<Record<string, CatalogClub[]>> = {
  'brasileirao-serie-a': [
    { name: 'Athletico-PR', color: '#CC0000' },
    { name: 'Atlético-MG', color: '#111111' },
    { name: 'Bahia', color: '#1C3F94' },
    { name: 'Botafogo', color: '#1A1A1A' },
    { name: 'Bragantino', color: '#E4002B' },
    { name: 'Corinthians', color: '#000000' },
    { name: 'Criciúma', color: '#F2A900' },
    { name: 'Cruzeiro', color: '#003DA5' },
    { name: 'Cuiabá', color: '#00A94F' },
    { name: 'Flamengo', color: '#E30613' },
    { name: 'Fluminense', color: '#7A003C' },
    { name: 'Fortaleza', color: '#1560BD' },
    { name: 'Grêmio', color: '#0D80C4' },
    { name: 'Internacional', color: '#C8102E' },
    { name: 'Juventude', color: '#6CBE45' },
    { name: 'Palmeiras', color: '#006437' },
    { name: 'São Paulo', color: '#FF0000' },
    { name: 'Vasco da Gama', color: '#1B1B1B' },
    { name: 'Vitória', color: '#C8102E' },
    { name: 'Atlético Goianiense', color: '#A6192E' },
  ],
  'premier-league': [
    { name: 'Arsenal', color: '#EF0107' },
    { name: 'Aston Villa', color: '#670E36' },
    { name: 'Bournemouth', color: '#DA291C' },
    { name: 'Brentford', color: '#E30613' },
    { name: 'Brighton', color: '#0057B8' },
    { name: 'Chelsea', color: '#034694' },
    { name: 'Crystal Palace', color: '#1B458F' },
    { name: 'Everton', color: '#003399' },
    { name: 'Fulham', color: '#000000' },
    { name: 'Ipswich Town', color: '#4B92DB' },
    { name: 'Leicester City', color: '#003090' },
    { name: 'Liverpool', color: '#C8102E' },
    { name: 'Manchester City', color: '#6CABDD' },
    { name: 'Manchester United', color: '#DA291C' },
    { name: 'Newcastle United', color: '#241F20' },
    { name: 'Nottingham Forest', color: '#DD0000' },
    { name: 'Southampton', color: '#D71920' },
    { name: 'Tottenham Hotspur', color: '#132257' },
    { name: 'West Ham United', color: '#7A263A' },
    { name: 'Wolverhampton Wanderers', color: '#FDB913' },
  ],
  bundesliga: [
    { name: 'Bayern Munich', color: '#DC052D' },
    { name: 'Borussia Dortmund', color: '#FDE100' },
    { name: 'RB Leipzig', color: '#DD0741' },
    { name: 'Bayer Leverkusen', color: '#E32221' },
    { name: 'Eintracht Frankfurt', color: '#E1000F' },
    { name: 'VfB Stuttgart', color: '#E32219' },
    { name: 'Borussia Mönchengladbach', color: '#000000' },
    { name: 'VfL Wolfsburg', color: '#65B32E' },
    { name: 'SC Freiburg', color: '#1B1B1B' },
    { name: 'Union Berlin', color: '#EB1923' },
    { name: 'Werder Bremen', color: '#1D9053' },
    { name: 'Mainz 05', color: '#C3141E' },
    { name: 'TSG Hoffenheim', color: '#1C63B7' },
    { name: 'FC Augsburg', color: '#BA3733' },
    { name: 'VfL Bochum', color: '#005CA9' },
    { name: '1. FC Heidenheim', color: '#B0142B' },
    { name: 'FC St. Pauli', color: '#6B2C3E' },
    { name: 'Holstein Kiel', color: '#002F6C' },
  ],
}
