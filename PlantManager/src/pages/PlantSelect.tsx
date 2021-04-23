import React, {useEffect, useState} from 'react';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import api from '../services/api';
import {useNavigation} from '@react-navigation/core';

import {EnvironmentButton} from '../components/EnvironmentButton';
import {Header} from '../components/Header';
import {PlantCardPrimary} from '../components/PlantCardPrimary';
import {Load} from '../components/Load';

import colors from '../styles/colors';
import fonts from '../styles/fonts';
import {PlantProps} from '../libs/storage';

interface EnvironmentProps {
  key: string;
  title: string;
}

export function PlantSelect() {
  // no useSate estou dizendo que ele é um vetor da coleção EnvironmentProps
  const [environments, setEnvironments] = useState<EnvironmentProps[]>([]);

  //estado do plantCard
  const [plants, setPlants] = useState<PlantProps[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);

  // estado para controlar o botao selecionado da lista environment//ambientes
  const [environmentSelected, setEnvironmentSelected] = useState('all');

  // estado da imagem do load enquanto carrega a API
  const [loading, setLoading] = useState(true);

  // estado para controlar paginação
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigation = useNavigation();

  // função para controlar o estado do botao selecionado da lista environment/ambientes
  function handleEnvironmentSelected(environment: string) {
    setEnvironmentSelected(environment);

    if (environment == 'all') return setFilteredPlants(plants);

    const filtered = plants.filter(plant =>
      plant.environments.includes(environment),
    );

    setFilteredPlants(filtered);
  }

  async function fetchPlants() {
    const {data} = await api.get(
      `plants?_sort=name&_order=asc&_page=${page}&_limit=8`,
    );

    // se nao tem nada para carregar, saia do loading
    if (!data) return setLoading(true);

    if (page > 1) {
      setPlants(oldValue => [...oldValue, ...data]);
      setFilteredPlants(oldValue => [...oldValue, ...data]);
    } else {
      // salvando os dados
      setPlants(data);
      setFilteredPlants(data);
    }

    //tirando o load quando a api carregar
    setLoading(false);
    setLoadingMore(false);
  }

  function handleFetchMore(distance: number) {
    if (distance < 1) return;

    setLoadingMore(true);
    setPage(oldValue => oldValue + 1);
    fetchPlants();
  }

  // função para navegar para outra página (plantSave)
  function handlePlantSelect(plant: PlantProps) {
    //chamando a tela e passando os dados de plant para ela
    navigation.navigate('PlantSave', {plant});
  }

  // hook para puxar os dados da api da rota plants_environments
  useEffect(() => {
    async function fetchEnvironment() {
      //passando a rota e também listando por ordem alfabetica = ?_sort=title&_order=asc
      const {data} = await api.get(
        'plants_environments?_sort=title&_order=asc',
      );

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
    fetchPlants();
  }, []);

  if (loading) return <Load />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header />

        <Text style={styles.title}>Em qual ambiente</Text>

        <Text style={styles.subtitle}>você quer colocar sua planta?</Text>
      </View>

      <View>
        <FlatList
          data={environments}
          keyExtractor={item => String(item.key)}
          renderItem={({item}) => (
            <EnvironmentButton
              title={item.title}
              active={item.key === environmentSelected}
              onPress={() => handleEnvironmentSelected(item.key)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.environmentList}
        />
      </View>

      <View style={styles.plant}>
        <FlatList
          data={filteredPlants}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <PlantCardPrimary
              data={item}
              onPress={() => handlePlantSelect(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          onEndReachedThreshold={0.1}
          onEndReached={({distanceFromEnd}) => handleFetchMore(distanceFromEnd)}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.green} /> : <></>
          }
        />
      </View>
    </View>
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
