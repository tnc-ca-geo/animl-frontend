import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';

import { 
  fetchModels,
  selectModels,
  selectSelectedView,
} from './viewsSlice';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';

const AutomationRulesForm = ({ handleClose }) => {
  const selectedView = useSelector(selectSelectedView);
  const models = useSelector(selectModels);
  const [ showAddRuleForm, setShowAddRuleForm ] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!models.length) {
      dispatch(fetchModels());
    }
  }, [models, dispatch]);

  const handleAddRuleClick = () => {
    setShowAddRuleForm(true);
  }

  const handleDiscardRuleClick = () => {
    setShowAddRuleForm(false);
  }

  return (
    <div>
      {models.length && selectedView
        ? showAddRuleForm
          ? <AddAutomationRuleForm
              view={selectedView}
              models={models}
              returnToRulesList={handleDiscardRuleClick} // TODO: ugly
            />
          : <AutomationRulesList
              view={selectedView}
              models={models}
              onAddRuleClick={handleAddRuleClick}
            />
        : <SpinnerOverlay>
            <PulseSpinner />
          </SpinnerOverlay>
      }
    </div>
  );
};

export default AutomationRulesForm;

