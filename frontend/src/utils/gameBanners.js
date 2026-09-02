export const GAME_BANNERS = {
  '8ball': '/assets/banners/8ball_banner.jpg',
  '8 ball pool': '/assets/banners/8ball_banner.jpg',
  '8 ball': '/assets/banners/8ball_banner.jpg',
  'bgmi': '/assets/banners/bgmi_banner.jpg',
  'pubg': '/assets/banners/bgmi_banner.jpg',
  'battlegrounds': '/assets/banners/bgmi_banner.jpg',
  'freefire': '/assets/banners/freefire_banner.jpg',
  'free fire': '/assets/banners/freefire_banner.jpg',
  'chess': '/assets/banners/chess_banner.jpg',
  'ludo': '/assets/banners/ludo_banner.jpg',
  'ludo king': '/assets/banners/ludo_banner.jpg',
  'carrom': '/assets/banners/carrom_banner.jpg',
  'carrom pool': '/assets/banners/carrom_banner.jpg'
};

export function getGameBanner(game, bannerUrl) {
  if (bannerUrl && typeof bannerUrl === 'string' && bannerUrl.trim().length > 5 && !bannerUrl.includes('undefined')) {
    return bannerUrl;
  }
  const name = (game || '').toString().toLowerCase().trim();
  if (name.includes('8') || name.includes('pool') || name.includes('cue')) {
    return '/assets/banners/8ball_banner.jpg';
  }
  if (name.includes('bgmi') || name.includes('pubg') || name.includes('battleground')) {
    return '/assets/banners/bgmi_banner.jpg';
  }
  if (name.includes('fire') || name.includes('free')) {
    return '/assets/banners/freefire_banner.jpg';
  }
  if (name.includes('chess')) {
    return '/assets/banners/chess_banner.jpg';
  }
  if (name.includes('ludo')) {
    return '/assets/banners/ludo_banner.jpg';
  }
  if (name.includes('carrom')) {
    return '/assets/banners/carrom_banner.jpg';
  }
  return GAME_BANNERS[name] || '/assets/banners/8ball_banner.jpg';
}
