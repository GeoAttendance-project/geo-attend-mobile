import { CommonActions } from '@react-navigation/native';

let navigator;

export const setNavigator = (nav) => {
  navigator = nav;
};

export const navigate = (name, params) => {
  if (!navigator) {
    console.warn('Navigator is not initialized yet.');
    return;
  }

  if (name === 'Signin') {
    navigator.dispatch(
      CommonActions.reset({
        index: 0, 
        routes: [{ name: 'ResolveAuth' }],
      })
    );
  } else {
    navigator.dispatch(
      CommonActions.navigate({
        name,
        params,
      })
    );
  }
};
