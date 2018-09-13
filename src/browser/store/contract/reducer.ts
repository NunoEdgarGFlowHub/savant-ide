import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import * as contractActions from './actions';
import { Contract, ContractState } from './types';
import fastHash from 'murmurhash3js';

type ContractAction = ActionType<typeof contractActions>;

const initialState: ContractState = {
  error: false,
  isLoading: false,
  isDeployingContract: false,
  isCallingTransition: false,
  active: { address: '', isChecking: false, isExecuting: false },
  contracts: {},
  events: {},
};

const contractReducer: Reducer<ContractState, ContractAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(contractActions.init): {
      return { ...state, isLoading: true };
    }

    case getType(contractActions.initSuccess): {
      const index = action.payload.contracts.reduce(
        (acc, cntr) => {
          return { ...acc, [cntr.address]: cntr };
        },
        {} as { [address: string]: Contract },
      );

      return { ...state, contracts: index, isLoading: false };
    }

    // for now, just put the entire store into an error state.
    case getType(contractActions.initError): {
      return { ...state, isLoading: false, error: true };
      break;
    }

    case getType(contractActions.deploy): {
      return { ...state, isDeployingContract: true };
    }

    case getType(contractActions.deploySuccess): {
      const { contract } = action.payload;
      const newIndex = { ...state.contracts, [contract.address]: contract };

      return { ...state, contracts: newIndex, isDeployingContract: false };
    }

    case getType(contractActions.deployError): {
      return { ...state, isDeployingContract: false };
    }

    case getType(contractActions.call): {
      return { ...state, isCallingTransition: true };
    }

    case getType(contractActions.callSuccess): {
      const { address, contract } = action.payload;
      const newIndex = { ...state.contracts, [address]: contract };
      return { ...state, contracts: newIndex, isCallingTransition: false };
    }

    case getType(contractActions.addEvent): {
      const { address, name, event } = action.payload;
      const id = fastHash.x86.hash32(address + name + JSON.stringify(event));

      return { ...state, events: { ...state.events, [id]: { address, name, event } } };
    }

    case getType(contractActions.clearEvent): {
      const { id } = action.payload;
      const { [id]: evt, ...rest } = state.events;

      return { ...state, events: { ...rest } };
    }

    default:
      return state;
  }
};

export default contractReducer;
