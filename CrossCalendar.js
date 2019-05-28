import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Image,
	Dimensions,
	Platform
} from 'react-native';

import moment from 'moment-jalaali';

import CrossCalendarItem from './CrossCalendarItem';

const leftArrow = require('./assets/left_arrow.png');
const rightArrow = require('./assets/right_arrow.png');

let dimension = Dimensions.get('window');

class CrossCalendar extends Component {
	state = {
		selectedDate: null,
		selectedMonthName: null,
		selectedIndex: 1,
		loadedMonths: [],
		currentMonth: null
	};

	initCalendarLocale = ({ type = 'gregorian' }) => {
		this.isJalaali = type === 'jalaali';

		this.monthNameFormat = this.isJalaali ? 'jYYYY - jMMMM' : 'YYYY - MMMM';
		this.yearFormat = this.isJalaali ? 'jYear' : 'year';
		this.monthFormat = this.isJalaali ? 'jMonth' : 'month';
		this.dayFormat = this.isJalaali ? 'jD' : 'D';

		this.isJalaali &&
			moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

		this.weekDays = moment.weekdaysShort(true);
	};

	initToday = () => {
		this.setState({
			selectedMonthName: moment().format(this.monthNameFormat)
		});
	};

	initCalendarItems = () => {
		let currentMonth = this.isJalaali ? moment().jMonth() : moment().month();
		this.setState({
			currentMonth,
			loadedMonths: [currentMonth - 1, currentMonth, currentMonth + 1]
		});
	};

	onSelectDate = date => {
		this.setState({ selectedDate: date });
	};

	onScroll = ({
		nativeEvent: {
			contentOffset: { x }
		}
	}) => {
		const { loadedMonths, currentMonth, selectedIndex } = this.state;

		var pageIndex = Math.round(x / dimension.width);

		if (pageIndex !== selectedIndex) {
			this.setState({
				selectedIndex: pageIndex,
				selectedMonthName: moment()
					.startOf(this.yearFormat)
					.add(this.monthFormat, loadedMonths[pageIndex])
					.format(this.monthNameFormat),
				currentMonth:
					pageIndex < selectedIndex ? currentMonth - 1 : currentMonth + 1
			});
		}
	};

	onMomentumScrollEnd = () => {
		const { currentMonth, loadedMonths, loadMonthsFlag } = this.state;

		if (loadedMonths[1] !== currentMonth) {
			this.setState(
				{
					selectedIndex: 1,
					loadMonthsFlag: !loadMonthsFlag,
					loadedMonths:
						currentMonth > loadedMonths[1]
							? [...loadedMonths.slice(1), currentMonth + 1]
							: [currentMonth - 1, ...loadedMonths.slice(0, -1)]
				},
				() => {
					console.log(this.state.loadedMonths);
					this.navigator.scrollToIndex({
						index: 1,
						animated: Platform.OS === 'android' ? true : false, // I don't know why, but it works!
						viewOffset: 0
					});
				}
			);
		}
	};

	renderCalendarItem = ({ item }) => {
		const { selectedDate } = this.state;
		const { type } = this.props;

		return (
			<CrossCalendarItem
				selectedDate={selectedDate}
				monthIndex={item}
				onSelectDate={this.onSelectDate}
				{...{ type }}
			/>
		);
	};

	componentWillMount() {
		this.initCalendarLocale(this.props);
		this.initToday();
		this.initCalendarItems();
	}

	render() {
		const { selectedMonthName, loadedMonths, loadMonthsFlag } = this.state;

		return (
			<View style={styles.container}>
				<View style={styles.headerContainer}>
					<TouchableOpacity
						activeOpacity={0.7}
						style={styles.moveMonthButtonContainer}>
						<Image source={leftArrow} style={styles.moveMonthButtonImage} />
					</TouchableOpacity>

					<View style={[styles.monthNameContainer]}>
						<Text style={[styles.monthNameText]}>{selectedMonthName}</Text>
					</View>

					<TouchableOpacity
						activeOpacity={0.7}
						style={styles.moveMonthButtonContainer}>
						<Image source={rightArrow} style={styles.moveMonthButtonImage} />
					</TouchableOpacity>
				</View>
				<View
					style={[
						styles.weekDaysContainer,
						this.isJalaali && { flexDirection: 'row-reverse' }
					]}>
					{this.weekDays.map(weekDay => (
						<View key={weekDay} style={styles.weekDayContainer}>
							<Text style={[styles.weekDayNameText]}>
								{weekDay.toUpperCase()}
							</Text>
						</View>
					))}
				</View>
				<FlatList
					inverted={this.isJalaali}
					horizontal
					extraData={loadMonthsFlag}
					pagingEnabled
					ref={ref => (this.navigator = ref)}
					showsHorizontalScrollIndicator={false}
					getItemLayout={(data, index) => ({
						length: dimension.width,
						offset: dimension.width * index,
						index
					})}
					initialScrollIndex={1}
					initialNumToRender={3}
					data={loadedMonths}
					keyExtractor={(item, index) => `${item}`}
					scrollEventThrottle={16}
					onScroll={this.onScroll}
					onMomentumScrollEnd={this.onMomentumScrollEnd}
					renderItem={this.renderCalendarItem}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#007eff',
		paddingVertical: 18
	},
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	moveMonthButtonContainer: {
		width: 50,
		height: 30,
		alignItems: 'center',
		justifyContent: 'center'
	},
	moveMonthButtonImage: {
		width: 8,
		height: 12
	},
	monthNamesListContentContainer: {},
	monthNameContainer: {
		width: dimension.width - 100
	},
	monthNameText: {
		textAlign: 'center',
		color: 'white',
		fontSize: 16
	},
	weekDaysContainer: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		marginTop: 10
	},
	weekDayContainer: {
		margin: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1
	},
	weekDayNameText: {
		color: '#00f1ff',
		fontSize: 12
	}
});

export default CrossCalendar;
