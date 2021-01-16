import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const [response, responseFavorites] = await Promise.all([
        api.get<Food>(`foods/${routeParams.id}`),
        api.get<Food[]>(`favorites`),
      ]);

      const foodFromApi = response.data;

      const newExtras = foodFromApi.extras.map(extra => ({
        ...extra,
        quantity: 0,
      }));

      const checkIsFavorite = responseFavorites.data.findIndex(
        favoriteFood => favoriteFood.id === foodFromApi.id,
      );

      if (checkIsFavorite >= 0) {
        setIsFavorite(true);
      }

      setExtras(newExtras);
      setFood(foodFromApi);
    }

    loadFood();
  }, [routeParams]);

  const handleIncrementExtra = useCallback((id: number): void => {
    setExtras(state => {
      return state.map(extra => {
        if (extra.id === id) {
          return { ...extra, quantity: extra.quantity + 1 };
        }

        return extra;
      });
    });
  }, []);

  const handleDecrementExtra = useCallback((id: number): void => {
    setExtras(state => {
      return state.map(extra => {
        if (extra.id === id && extra.quantity !== 0) {
          return { ...extra, quantity: extra.quantity - 1 };
        }

        return extra;
      });
    });
  }, []);

  const handleIncrementFood = useCallback((): void => {
    setFoodQuantity(state => state + 1);
  }, []);

  const handleDecrementFood = useCallback((): void => {
    setFoodQuantity(state => (state !== 1 ? state - 1 : state));
  }, []);

  const toggleFavorite = useCallback(async () => {
    if (isFavorite) {
      setIsFavorite(false);

      await api.delete(`favorites/${food.id}`);
      return;
    }

    setIsFavorite(false);

    await api.post('favorites', food);
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    const valueFromDish = food.price * foodQuantity;
    const valueFromExtras = extras
      .map(extra => extra.quantity * extra.value)
      .reduce((total, numero) => total + numero, 0);

    const totalValue = valueFromDish + valueFromExtras;

    return formatValue(totalValue);
  }, [extras, food, foodQuantity]);

  const handleFinishOrder = useCallback(async (): Promise<void> => {
    const order = {
      ...food,
      id: undefined,
      product_id: food.id,
      price: cartTotal,
      extras,
    };

    await api.post('orders', order);
  }, [cartTotal, extras, food]);

  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={toggleFavorite}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
