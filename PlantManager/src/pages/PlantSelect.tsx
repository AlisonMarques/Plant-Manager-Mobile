import React, {useEffect, useState} from 'react';

import {StyleSheet, Text, View, FlatList, SafeAreaView} from 'react-native';
import {EnvironmentButton} from '../components/EnvironmentButton';

import {Header} from '../components/Header';
import {PlantCardPrimary} from '../components/PlantCardPrimary';
import api from '../services/api';

import colors from '../styles/colors';
import fonts from '../styles/fonts';

interface EnvironmentProps {
  key: string;
  title: string;
}

interface PlantProps {
  id: number;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: [string];
  frequency: {
    times: number;
    repeat_every: string;
  };
}

export function PlantSelect() {
  // no useSate estou dizendo que ele é um vetor da coleção EnvironmentProps
  const [environments, setEnvironments] = useState<EnvironmentProps[]>([]);

  const [plants, setPlants] = useState<PlantProps[]>([]);

  // hook para puxar os dados da api da rota plants_environments
  useEffect(() => {
    async function fetchEnvironment() {
      const {data} = await api.get('plants_environments');

      // salvando os dados
      setEnvironments([
        {
          key: 'all',
          title: 'Todos',
        },
        ...data,
      ]);
    }
    fetchEnvironment();
  }, []);

  // hook para puxar os dados da api da rota plants
  useEffect(() => {
    async function fetchPlants() {
      const {data} = await api.get('plants');

      // salvando os dados
      setPlants(data);
    }
    fetchPlants();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.header}>
          <Header />

          <Text style={styles.title}>Em qual ambiente</Text>

          <Text style={styles.subtitle}>você quer colocar sua planta?</Text>
        </View>

        <View>
          <FlatList
            data={environments}
            renderItem={({item}) => <EnvironmentButton title={item.title} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.environmentList}
          />
        </View>

        <View style={styles.plant}>
          <FlatList
            data={plants}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => <PlantCardPrimary data={item} />}
            showsVerticalScrollIndicator={false}
            numColumns={2}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.heading,
    lineHeight: 20,
    marginTop: 15,
  },
  subtitle: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 20,
    color: colors.heading,
  },
  environmentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    paddingLeft: 32,
    marginVertical: 32,
  },
  plant: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
});
