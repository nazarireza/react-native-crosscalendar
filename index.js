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

const leftArrow = require('./assets/left_arrow.png');
const rightArrow = require('./assets/right_arrow.png');

moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

let dimension = Dimensions.get('window');
const weekDays = moment.weekdaysShort(true);
const now = moment();

class CrossCalendarItem extends Component {
	shouldComponentUpdate({ monthIndex, selectedDate }, nextStates) {
		if (
			selectedDate &&
			moment(selectedDate).jMonth() ==
				moment()
					.startOf('jYear')
					.add(monthIndex, 'jMonth')
					.jMonth() &&
			this.selectedDate !== selectedDate
		) {
			// Select this month day and component updates.
			console.log('Select this month day and component updates.');
			this.isSelectThisMonth = true;
			this.selectedDate = selectedDate;
			return true;
		} else if (this.isSelectThisMonth && this.selectedDate !== selectedDate) {
			// Deselect this month day and component updates.
			console.log('Deselect this month day and component updates.');
			this.isSelectThisMonth = false;
			this.selectedDate = null;
			return true;
		} else if (!this.isInitialize) {
			// First component render and component updates.
			console.log('First component render and component updates.');
			this.isInitialize = true;
			return true;
		} else {
			// There is not changes and component doesn't update.
			// console.log('There is not changes and component doesnt update.');
			return false;
		}
	}

	getWeeks = monthIndex => {
		let monthContext = moment()
			.startOf('jYear')
			.add(monthIndex, 'jMonth');

		let startPoint = monthContext.clone().startOf('week');

		let weeks = [];
		for (let i = 0; i < 6; i++) {
			// Iterate weeks (Max week count is 6)

			let week = [];
			for (let j = 0; j < 7; j++) {
				// Iterate week days (Max week days count is 7)

				let date = startPoint.clone().add(i * 7 + j, 'd');

				let title = date.format('jD');
				let isInThisMonth = date.jMonth() === monthContext.jMonth();
				let isToday = date.format('YYYYMMDD') === now.format('YYYYMMDD');
				let isDayOff = date.weekday() == 6;

				week.push({
					title,
					date,
					isInThisMonth,
					isToday,
					isDayOff
				});
			}

			weeks.push(week);
		}

		return weeks;
	};

	componentWillMount() {
		const { monthIndex } = this.props;
		this.weeks = this.getWeeks(monthIndex);

		this.isInitialize = true;
	}

	render() {
		const { monthIndex, onSelectDate, selectedDate } = this.props;

		console.log(`Render: ${monthIndex}`);

		return (
			<View style={[styles.weeksContainer]}>
				{this.weeks.map((week, i) => (
					<View
						key={`${monthIndex}-${i}`}
						style={[
							styles.weekDaysContainer,
							{ flexDirection: 'row-reverse' }
						]}>
						{week.map(({ date, title, isToday, isDayOff, isInThisMonth }) => (
							<View
								key={`${monthIndex}-${isInThisMonth}-${date}`}
								style={[styles.weekDayContainer]}>
								<TouchableOpacity
									disabled={!isInThisMonth}
									activeOpacity={0.7}
									onPress={() => {
										isInThisMonth && onSelectDate(date);
									}}
									style={[
										styles.weekDayContentContainer,
										isToday && styles.currentWeekDayContentContainer,
										isInThisMonth &&
											selectedDate &&
											selectedDate.format('YYYYMMDD') ===
												date.format('YYYYMMDD') &&
											styles.selectedWeekDayContentContainer
									]}>
									<Text
										style={[
											styles.weekDayText,
											isInThisMonth && isToday && styles.currentWeekDayText,
											isInThisMonth && isDayOff && styles.dayOffWeekDayText,
											!isInThisMonth && styles.outOfMonthDayText
										]}>
										{title}
									</Text>
								</TouchableOpacity>
							</View>
						))}
					</View>
				))}
			</View>
		);
	}
}

class CrossCalendar extends Component {
	state = {
		selectedDate: null,
		selectedMonthName: moment().format('jYYYY-jMMMM'),
		selectedIndex: 1,
		loadedMonths: [],
		currentMonth: null
	};

	onSelectDate = date => {
		this.setState({ selectedDate: date });
	};

	componentWillMount() {
		let currentMonth = moment().jMonth();
		this.setState({
			currentMonth,
			loadedMonths: [currentMonth - 1, currentMonth, currentMonth + 1]
		});
	}

	render() {
		const {
			selectedDate,
			selectedMonthName,
			loadedMonths,
			currentMonth,
			loadMonthsFlag
		} = this.state;

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
					style={[styles.weekDaysContainer, { flexDirection: 'row-reverse' }]}>
					{weekDays.map(weekDay => (
						<View key={weekDay} style={styles.weekDayContainer}>
							<Text style={[styles.weekDayNameText]}>
								{weekDay.toUpperCase()}
							</Text>
						</View>
					))}
				</View>
				<FlatList
					inverted
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
					keyExtractor={(item, index) => {
						return `${item}`;
					}}
					scrollEventThrottle={16}
					onScroll={({
						nativeEvent: {
							contentOffset: { x }
						}
					}) => {
						var pageIndex = Math.round(x / dimension.width);

						const { selectedIndex } = this.state;

						if (pageIndex !== selectedIndex) {
							this.setState({
								selectedIndex: pageIndex,
								selectedMonthName: moment()
									.startOf('jYear')
									.add('jMonth', loadedMonths[pageIndex])
									.format('jYYYY-jMMMM'),
								currentMonth:
									pageIndex < selectedIndex
										? currentMonth - 1
										: currentMonth + 1
							});
						}
					}}
					onMomentumScrollEnd={() => {
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
					}}
					renderItem={({ item }) => {
						return (
							<CrossCalendarItem
								selectedDate={selectedDate}
								monthIndex={item}
								onSelectDate={this.onSelectDate}
							/>
						);
					}}
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
		marginTop: 16
	},
	weekDayContainer: {
		margin: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1
	},
	weekDayContentContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		aspectRatio: 1
	},
	currentWeekDayContentContainer: {
		backgroundColor: 'white',
		borderRadius: 50
	},
	selectedWeekDayContentContainer: {
		backgroundColor: 'black',
		borderRadius: 50
	},
	weekDayNameText: {
		color: '#00f1ff',
		fontSize: 12
	},
	weekDayText: {
		color: 'white',
		fontSize: 12,
		margin: 5
	},
	currentWeekDayText: {
		color: '#007eff',
		fontWeight: 'bold'
	},
	dayOffWeekDayText: {
		color: '#0054aa'
	},
	outOfMonthDayText: {
		color: 'rgba(255,255,255,.4)'
	},
	weeksContainer: {
		width: dimension.width
	}
});

export default CrossCalendar;
