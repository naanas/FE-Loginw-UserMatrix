import { AccessMenu, Spot } from '../types/user';

type RawSpot = {
  id: string;
  name: string;
  action: string;
};

type RawAccessMenu = {
  menu: {
    id: string;
    name: string;
    spots: RawSpot[];
  };
};

export function transformAccessMenu(raw: RawAccessMenu[]): AccessMenu[] {
  return raw.map(({ menu }) => {
    const spotMap = new Map<string, Spot>();

    menu.spots.forEach(spot => {
      const existing = spotMap.get(spot.id);
      const newActions = [
        ...(existing?.action || []),
        ...(Array.isArray(spot.action) ? spot.action : [spot.action]),
      ];

      spotMap.set(spot.id, {
        id: spot.id,
        name: spot.name,
        action: Array.from(new Set(newActions)), // ensure unique
      });
    });

    return {
      menu: {
        id: menu.id,
        name: menu.name,
        spots: Array.from(spotMap.values()),
      },
    };
  });
}
