import React, { useEffect, useState } from 'react';
import { FieldRow, StandAloneInput } from './Form.jsx';

const PermanentActionConfirmation = ({ text, setConfirmed }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setConfirmed(value === text);
  }, [value, text, setConfirmed]);

  return (
    <div>
      <p>
        To confirm, type <strong style={{ fontStyle: 'italic' }}>{text}</strong> in the text input
        field:
      </p>
      <FieldRow>
        <StandAloneInput
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </FieldRow>
    </div>
  );
};

export default PermanentActionConfirmation;
