import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions
} from 'react-native';

import moment from 'moment-jalaali';

let dimension = Dimensions.get('window');

class CrossCalendarItem extends Component {
	constructor(props) {
		super(props);

		this.initCalendarLocale(props);
	}

	initCalendarLocale = ({ type = 'gregorian' }) => {
		this.isJalaali = type === 'jalaali';

		this.monthNameFormat = this.isJalaali ? 'jYYYY - jMMMM' : 'YYYY - MMMM';
		this.yearFormat = this.isJalaali ? 'jYear' : 'year';
		this.monthFormat = this.isJalaali ? 'jMonth' : 'month';
		this.dayFormat = this.isJalaali ? 'jD' : 'D';
	};

	shouldComponentUpdate({ monthIndex, selectedDate }, nextStates) {
		let selectedDateMonth =
			selectedDate &&
			(this.isJalaali
				? moment(selectedDate).jMonth()
				: moment(selectedDate).month());
		let thisMonth =
			selectedDate &&
			(this.isJalaali
				? moment()
					.startOf(this.yearFormat)
					.add(monthIndex, this.monthFormat)
					.jMonth()
				: moment()
					.startOf(this.yearFormat)
					.add(monthIndex, this.monthFormat)
					.month());

		if (
			selectedDate &&
			selectedDateMonth == thisMonth &&
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

	getWeekDays = () => {
		this.weekDays = moment.weekdaysShort(true);
	};

	getWeeks = () => {
		const { monthIndex } = this.props;

		let monthContext = moment()
			.startOf(this.yearFormat)
			.add(monthIndex, this.monthFormat);

		let startPoint = monthContext.clone().startOf('week');

		let weeks = [];
		for (let i = 0; i < 6; i++) {
			// Iterate weeks (Max week count is 6)

			let week = [];
			for (let j = 0; j < 7; j++) {
				// Iterate week days (Max week days count is 7)

				let date = startPoint.clone().add(i * 7 + j, 'd');

				let title = date.format(this.dayFormat);
				let isInThisMonth = this.isJalaali
					? date.jMonth() === monthContext.jMonth()
					: date.month() === monthContext.month();
				let isToday =
					isInThisMonth &&
					date.format('YYYYMMDD') === moment().format('YYYYMMDD');
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

		this.weeks = weeks;
		this.isInitialize = true;

		return weeks;
	};

	componentWillMount() {
		this.getWeekDays();
		this.getWeeks();
	}

	render() {
		const { monthIndex, onSelectDate, selectedDate, type } = this.props;

		console.log(`Render: ${type}-${monthIndex}`);

		return (
			<View style={[styles.weeksContainer]}>
				{this.weeks.map((week, i) => (
					<View
						key={`${monthIndex}-${i}`}
						style={[
							styles.weekDaysContainer,
							this.isJalaali && { flexDirection: 'row-reverse' }
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

const styles = StyleSheet.create({
	weeksContainer: {
		width: dimension.width
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
		fontSize: 15,
		margin: 5
	},
	currentWeekDayText: {
		color: '#007eff',
		fontWeight: 'bold'
	},
	dayOffWeekDayText: {
		color: 'yellow'
	},
	outOfMonthDayText: {
		color: 'rgba(255,255,255,.4)'
	}
});

export default CrossCalendarItem;
