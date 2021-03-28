import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from "react-native";
const MainScreenButton = (props) => {
    const [isButtonFocused, setIsButtonFocused] = useState(false);
    const {text,onPress}= props;
    return (
        <Pressable
            underlayColor="none"
            style={
                isButtonFocused
                    ? { ...styles.button, opacity: 0.6 }
                    : styles.button
            }
            onPressIn={() => setIsButtonFocused(true)}
            onPressOut={() => setIsButtonFocused(false)}
            onPress={onPress}>
            <Text style={styles.button_text}>{text}</Text>
        </Pressable>
    )
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#195496',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#195496',
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: '2%',
        opacity: 1,
    },
    button_text: {
        color: '#f5f1e6',
        fontSize: 20,
    },
})

export default MainScreenButton;