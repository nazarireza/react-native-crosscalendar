import React, { Component, PureComponent } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Image,
	Dimensions,
	ViewPropTypes,
	ScrollView
} from 'react-native';

import moment from 'moment';
import { globalStyles } from '../../src/assets/styles';

let dimension = Dimensions.get('window');

const leftArrow = require('./assets/left_arrow.png');
const rightArrow = require('./assets/right_arrow.png');

const months = moment.months();
const weekDays = moment.weekdaysShort();

class CrossCalendarItem extends Component {
	shouldComponentUpdate(nextProps, nextState) {
		const { item, selectedDate } = nextProps;

		if (selectedDate && moment(selectedDate).month() == item) {
			this.isSelectThisMonth = true;
			return true;
		} else if (this.isSelectThisMonth) {
			this.isSelectThisMonth = false;
			return true;
		} else {
			return false;
		}
	}

	getFirstDayOfWeek = monthContext => {
		return monthContext.startOf('month').format('d');
	};

	getFirstDayOfWeekForNextMonth = monthContext => {
		return monthContext
			.add(1, 'months')
			.startOf('month')
			.format('d');
	};

	getDaysInMonth = monthContext => {
		return monthContext.daysInMonth();
	};

	getWeeks = month => {
		let now = moment();

		let monthContext = moment()
			.startOf('month')
			.set('month', month);

		let monthDays = [];

		let firstDayOfWeek = this.getFirstDayOfWeek(monthContext);
		let preMonthContext = moment(monthContext).add(-firstDayOfWeek, 'd');
		for (let i = 0; i < firstDayOfWeek; i++) {
			monthDays.push({
				date: preMonthContext.add(i, 'd').toDate(),
				title: '',
				isInThisMonth: false
			});
		}

		let daysInMonth = this.getDaysInMonth(monthContext);
		for (let i = 0; i < daysInMonth; i++) {
			monthDays.push({
				date: monthContext.toDate(),
				title: `${i + 1}`,
				isInThisMonth: true,
				isCurrentDate: monthContext.dayOfYear() === now.dayOfYear(),
				isDayOff: monthContext.format('d') === '6'
			});

			monthContext.add(1, 'd');
		}

		let firstDayOfWeekForNextMonth = this.getFirstDayOfWeekForNextMonth(
			monthContext
		);
		for (let i = firstDayOfWeekForNextMonth, j = 0; i < 7; i++, j++) {
			monthDays.push({
				date: monthContext
					.startOf('month')
					.add(j, 'd')
					.toDate(),
				title: '',
				isInThisMonth: false
			});
		}

		let weeks = [];
		let week = [];

		for (let i = 1; i <= monthDays.length; i++) {
			week.push(monthDays[i - 1]);

			if (i % 7 === 0) {
				weeks.push([...week]);
				week = [];
			}
		}

		return weeks;
	};

	render() {
		const { item, onSelectDate, selectedDate } = this.props;

		// console.log(item);

		let weeks = this.getWeeks(item);

		return (
			<View style={styles.weeksContainer}>
				{weeks.map((week, i) => (
					<View key={`${item}-${i}`} style={styles.weekDaysContainer}>
						{week.map(
							({ date, title, isCurrentDate, isDayOff, isInThisMonth }) => (
								<View
									key={`${item}-${isInThisMonth}-${date.getTime()}`}
									style={[styles.weekDayContainer]}>
									<TouchableOpacity
										activeOpacity={0.7}
										onPress={() => {
											isInThisMonth && onSelectDate(date);
										}}
										style={[
											styles.weekDayContentContainer,
											isCurrentDate && styles.currentWeekDayContentContainer,
											isInThisMonth &&
												selectedDate &&
												selectedDate.getTime() === date.getTime() &&
												styles.selectedWeekDayContentContainer
										]}>
										<Text
											style={[
												styles.weekDayText,
												isInThisMonth &&
													isCurrentDate &&
													styles.currentWeekDayText,
												isInThisMonth && isDayOff && styles.dayOffWeekDayText
											]}>
											{title}
										</Text>
									</TouchableOpacity>
								</View>
							)
						)}
					</View>
				))}
			</View>
		);
	}
}

class CrossCalendar extends Component {
	state = {
		selectedDate: null,
		selectedMonth: moment().format('MMMM')
	};

	onSelectDate = date => {
		this.setState({ selectedDate: date });
	};

	render() {
		const { selectedDate, selectedMonth } = this.state;

		let currentMonth = moment().month();

		return (
			<View style={styles.container}>
				<View style={styles.headerContainer}>
					<TouchableOpacity
						activeOpacity={0.7}
						style={styles.moveMonthButtonContainer}>
						<Image source={leftArrow} style={styles.moveMonthButtonImage} />
					</TouchableOpacity>
					{/* <FlatList
						contentContainerStyle={styles.monthNamesListContentContainer}
						showsHorizontalScrollIndicator={false}
						data={months}
						horizontal
						scrollEnabled={false}
						pagingEnabled
						keyExtractor={p => p}
						initialScrollIndex={currentMonth}
						getItemLayout={(data, index) => ({
							length: dimension.width - 100,
							offset: (dimension.width - 100) * index,
							index
						})}
						renderItem={({ item }) => (
							<View style={[styles.monthNameContainer]}>
								<Text style={[styles.monthNameText]}>{item}</Text>
							</View>
						)}
					/> */}

					<View style={[styles.monthNameContainer]}>
						<Text style={[globalStyles.text, styles.monthNameText]}>
							{selectedMonth}
						</Text>
					</View>

					<TouchableOpacity
						activeOpacity={0.7}
						style={styles.moveMonthButtonContainer}>
						<Image source={rightArrow} style={styles.moveMonthButtonImage} />
					</TouchableOpacity>
				</View>
				<View style={styles.weekDaysContainer}>
					{weekDays.map(weekDay => (
						<View key={weekDay} style={styles.weekDayContainer}>
							<Text style={[styles.weekDayNameText]}>
								{weekDay.toUpperCase()}
							</Text>
						</View>
					))}
				</View>
				<FlatList
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					getItemLayout={(data, index) => ({
						length: dimension.width,
						offset: dimension.width * index,
						index
					})}
					initialScrollIndex={currentMonth}
					data={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
					onMomentumScrollEnd={({ nativeEvent: { contentOffset: offset } }) => {
						if (offset) {
							var pageIndex = Math.round(offset.x / dimension.width);
							this.setState({
								selectedMonth: moment()
									.set('month', pageIndex)
									.format('MMMM')
							});
						}
					}}
					renderItem={({ item }) => {
						return (
							<CrossCalendarItem
								selectedDate={selectedDate}
								item={item}
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
		flex: 1,
		padding: 5
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
		fontSize: 14
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
	weeksContainer: {
		width: dimension.width
	}
});

export default CrossCalendar;
