import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  selectSelectedProject,
  selectSelectedView
} from '../projects/projectsSlice';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';


const AutomationRulesForm = ({ handleClose }) => {
  const selectedProject = useSelector(selectSelectedProject);
  const selectedView = useSelector(selectSelectedView);
  const models = selectedProject.availableMLModels;
  const [ showAddRuleForm, setShowAddRuleForm ] = useState(false);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (!models.length) {
  //     dispatch(fetchModels());
  //   }
  // }, [models, dispatch]);

  const handleAddRuleClick = () => {
    setShowAddRuleForm(true);
  }

  const hideAddRuleForm = () => {
    setShowAddRuleForm(false);
  }

  return (
    <div>
      {models.length && selectedView
        ? showAddRuleForm
          ? <AddAutomationRuleForm
              view={selectedView}
              models={models}
              hideAddRuleForm={hideAddRuleForm}
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

