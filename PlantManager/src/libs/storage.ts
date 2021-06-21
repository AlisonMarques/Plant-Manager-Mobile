import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import {format} from 'date-fns';

export interface PlantProps {
  id: string;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: [string];
  frequency: {
    times: number;
    repeat_every: string;
  };
  hour: string;
  dateTimeNotification: Date;
}

export interface StoragePlantProps {
  [id: string]: {
    data: PlantProps;
  };
}

export async function savePlant(plant: PlantProps): Promise<void> {
  try {
    const nexTime = new Date(plant.dateTimeNotification);
    const now = new Date();

    const {times, repeat_every} = plant.frequency;

    //verificando se a repetição é semanal
    if (repeat_every === 'week') {
      const interval = Math.trunc(7 / times);
      nexTime.setDate(now.getDate() + interval);
    } else nexTime.setDate(nexTime.getDate() + 1);

    // pegando os segundos de uma notificação para a outra. a diferença...
    const seconds = Math.abs(
      Math.ceil(now.getTime() - nexTime.getTime() / 1000),
    );

    //Armazenando o id da notification criado
    const messageNotification = PushNotification.localNotification({
      title: 'Heey, 🌱',
      message: `Está na hora de cuida da sua ${plant.name}`,
      playSound: true,
      vibrate: true,
      priority: 'high',
    });

    const notificationId = PushNotification.localNotificationSchedule({
      message: `Está na hora de cuida da sua ${plant.name}`,
      date: new Date(Date.now() + 60 * 1000),
    });

    const data = await AsyncStorage.getItem('@plantmanager:plants');
    // transformando os dados em objeto
    const oldPlants = data ? (JSON.parse(data) as StoragePlantProps) : {};

    const newPlant = {
      [plant.id]: {
        data: plant,
      },
    };

    // salvando as plantas novas e mantendo as antigas
    await AsyncStorage.setItem(
      '@plantmanager:plants',
      JSON.stringify({
        ...newPlant,
        ...oldPlants,
      }),
    );
  } catch (error) {
    throw new Error(error);
  }
}

export async function loadPlant(): Promise<PlantProps[]> {
  try {
    const data = await AsyncStorage.getItem('@plantmanager:plants');
    // transformando os dados em objeto
    const plants = data ? (JSON.parse(data) as StoragePlantProps) : {};

    const plantsSorted = Object.keys(plants)
      .map(plant => {
        return {
          ...plants[plant].data,
          hour: format(
            new Date(plants[plant].data.dateTimeNotification),
            'HH:mm',
          ),
        };
      })
      .sort((a, b) =>
        Math.floor(
          new Date(a.dateTimeNotification).getTime() / 1000 -
            Math.floor(new Date(b.dateTimeNotification).getTime() / 1000),
        ),
      );

    return plantsSorted;
  } catch (error) {
    throw new Error(error);
  }
}

export async function removePlant(id: string): Promise<void> {
  const data = await AsyncStorage.getItem('@plantmanager:plants');
  const plants = data ? (JSON.parse(data) as StoragePlantProps) : {};

  delete plants[id];

  await AsyncStorage.setItem('@plantmanager:plants', JSON.stringify(plants));
}
