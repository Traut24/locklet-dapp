import { Button, Input, InputGroup, InputLeftAddon, InputRightElement, useColorMode } from '@chakra-ui/react';
import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { FaCalendarDay } from 'react-icons/fa';

import './date-picker.css';
import 'react-datepicker/dist/react-datepicker.css';

const DatePicker = ({ minDate, selectedDate, onChange, isClearable = false, showPopperArrow = false, ...props }) => {
  const isLight = useColorMode().colorMode === 'light';

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <InputGroup size="md">
      <Input type="text" value={value} ref={ref} readOnly />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={onClick}>
          <FaCalendarDay />
        </Button>
      </InputRightElement>
    </InputGroup>
  ));

  return (
    <div className={isLight ? 'light-theme' : 'dark-theme'}>
      {' '}
      {/* light-theme-original */}{' '}
      <ReactDatePicker
        minDate={minDate}
        selected={selectedDate}
        onChange={onChange}
        isClearable={isClearable}
        showPopperArrow={showPopperArrow}
        className="react-datapicker__input-text"
        customInput={<CustomInput />}
        {...props}
      />
    </div>
  );
};

export default DatePicker;
