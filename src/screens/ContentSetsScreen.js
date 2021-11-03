import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {FlatList, RefreshControl, Text} from 'react-native';
import {useQuery} from 'react-query';

import Card from '../components/Card';
import CardItemRow from '../components/CardItemRow';
import ContentSet from '../components/ContentSet';
import ContentSetEntry from '../components/ContentSetEntry';
import ErrorDisplay from '../components/ErrorDisplay';
import NoSiteSelected from '../components/NoSiteSelected';
import ToggleDrawerButton from '../components/ToggleDrawerButton';
import {useAppState} from '../hooks/appState';
import gStyles from '../styles/main';
import axios from 'axios';

const TYPE_MAP = {
	0: 'Dynamic Selction',
	1: 'Manual Seleciton',
};

const ContentSets = ({navigation}) => {
	const [state, , request] = useAppState();

	const {siteId} = state;

	const {data, error, refetch, status} = useQuery(
		siteId && ['contentSets', siteId],
		() => {
			return request(
				`/api/jsonws/assetlist.assetlistentry/get-asset-list-entries/group-id/${siteId}/start/-1/end/-1/-order-by-comparator?p_auth=3qDjOesK`
			);
		}
	);

	const items = data ? data : [];

	const renderItem = ({item}) => (
		<Card
			onPress={() =>
				navigation.navigate('ContentSet', {
					contentSetId: item.assetListEntryId,
					title: item.title,
				})
			}
			title={item.title}
		>
			<CardItemRow label="Id" value={item.assetListEntryId} />
			<CardItemRow label="Type" value={TYPE_MAP[item.type]} />
		</Card>
	);

	if (!siteId) {
		return <NoSiteSelected />;
	}

	return (
		<>
			{items && (
				<FlatList
					ListHeaderComponent={
						<>
							{status === 'error' && (
								<ErrorDisplay
									error={error.message}
									onRetry={() => refetch()}
								/>
							)}

							{items &&
								items.length === 0 &&
								status === 'success' && (
									<Text
										style={[gStyles.m2, gStyles.textCenter]}
									>
										There are no collections to display.
									</Text>
								)}
						</>
					}
					data={items}
					keyExtractor={({assetListEntryId}) => assetListEntryId}
					refreshControl={
						<RefreshControl
							onRefresh={() => refetch()}
							refreshing={status === 'loading'}
						/>
					}
					renderItem={(obj) => renderItem(obj)}
				/>
			)}
		</>
	);
};

const Stack = createStackNavigator();

function ContentSetsNavigation({navigation}) {
	return (
		<Stack.Navigator
			initialRouteName="ContentSets"
			screenOptions={{
				headerRight: () => (
					<ToggleDrawerButton navigation={navigation} />
				),
			}}
		>
			<Stack.Screen
				component={ContentSets}
				name="ContentSets"
				options={{title: 'Collections'}}
			/>
			<Stack.Screen
				component={ContentSet}
				name="ContentSet"
				options={({route}) => {
					return {title: route.params.title};
				}}
			/>
			<Stack.Screen
				component={ContentSetEntry}
				name="ContentSetEntry"
				options={({route}) => {
					return {title: route.params.title};
				}}
			/>
		</Stack.Navigator>
	);
}

export default ContentSetsNavigation;
