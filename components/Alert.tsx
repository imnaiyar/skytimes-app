import React from 'react';
import { Alert} from 'react-native';

type AlertProps = {
  title?: string;
  description?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

export function ConfirmAlert({ title = "Are you sure?", description = "Please confirm your action!", onOk, onCancel }: AlertProps) {
  Alert.alert(title, description, [
    {
      text: "Cancel",
      onPress: () => onCancel && onCancel(),
      style: "cancel"
    },
    {
      text: "Yes",
      onPress: () => onOk && onOk()
    }
    ]);
}