import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "https://your-api.onrender.com/chat"; // Replace with your deployed backend URL

export default function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (input.trim() === "" || loading) return;

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await response.json();
            console.log("Response:", data);

            if (!response.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            const aiReply = data.choices?.[0]?.message?.content || "No response from AI.";
            setMessages([...newMessages, { role: "assistant", content: aiReply }]);
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Error: " + error.message }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageContainer,
                        item.role === "user" ? styles.userMessage : styles.aiMessage
                    ]}>
                        <Text style={[
                            styles.messageText,
                            item.role === "user" ? styles.userMessageText : styles.aiMessageText
                        ]}>
                            {item.content}
                        </Text>
                    </View>
                )}
                inverted
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type your message..."
                    editable={!loading}
                />

                {loading ? (
                    <ActivityIndicator style={{ marginLeft: 10 }} color="gray" />
                ) : (
                    <TouchableOpacity onPress={sendMessage}>
                        <Ionicons name="send" size={24} color="blue" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: "80%",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#0084ff"
    },
    aiMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#e0e0e0"
    },
    messageText: {
        fontSize: 16,
    },
    userMessageText: {
        color: "#fff",
    },
    aiMessageText: {
        color: "#000",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#fff"
    },
    input: {
        flex: 1,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10
    },
});
