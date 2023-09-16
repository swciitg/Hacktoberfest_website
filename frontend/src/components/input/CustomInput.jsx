import React, { useState } from "react";
import PropTypes from "prop-types";

const InputField = ({
  value,
  label,
  placeholder,
  type,
  onChange,
  classNameInput,
  classNameDiv,
  classNameLabel,
  classNameError,
  isRequired,
  inputRef,
  onEventChange,
  name,
  extraProps,
  isTextArea
}) => {
  const [error, setError] = useState(false);
  const handleChange = (event) => {
    const { value } = event.target;
    onChange && onChange(value);
    onEventChange && onEventChange(event);
  };

  console.log(value)

  return (
    <div className={classNameDiv}>
      {label && (
        <label className={classNameLabel}>
          <div>
            {label}
            {isRequired && <span className="text-red-500"> *</span>}
          </div>
        </label>
      )}
      {isTextArea ?<textarea ref={inputRef} 
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        rows="4"
        className={classNameInput}
        required={isRequired}
        style={{resize:"none"}}
        {...extraProps}>
        </textarea>:
      <input
        ref={inputRef}
        type={type}
        defaultValue={value}
        className={classNameInput}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        required={isRequired}
        onWheel={(e) => e.target.blur()}
        {...extraProps}
      />
}
      {error && <span className={classNameError}>{error.message}</span>}
    </div>
  );
};

InputField.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  classNameDiv: PropTypes.string.isRequired,
  classNameLabel: PropTypes.string.isRequired,
  classNameInput: PropTypes.string.isRequired,
  classNameError: PropTypes.string.isRequired,
};

InputField.defaultProps = {
  value: "",
  label: "",
  placeholder: "",
  type: "text",
};

export default InputField;
