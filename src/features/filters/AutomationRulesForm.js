import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import { 
  fetchModels,
  selectModels,
  selectSelectedView,
} from '../views/viewsSlice';

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
        : <div>loading...</div>
      }
    </div>
  );
};

export default AutomationRulesForm;

