import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export function AuthInput(props: TextInputProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <TextInput
      style={[
        styles.input,
        {
          color: textColor,
          backgroundColor,
          borderColor,
        },
      ]}
      placeholderTextColor={borderColor}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
}); 