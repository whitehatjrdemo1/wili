import React from "react";
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";

export default class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailId: "",
      password: "",
    };
  }
  login = async (email, password) => {
    if (email && password) {
      try {
        const response = await firebase
          .auth()
          .signInWithEmailAndPassword(email, password);
        if (response) {
          this.props.navigation.navigate("Transaction");
        }
      } catch (error) {
        switch (error.code) {
          case "auth/user-not-found":
            Alert.alert("user does not exist");
            console.log("user does not exist");
            break;
          case "auth/invalid-email":
            Alert.alert("incorrect email or password");
            console.log("incorrect email or password");
          default:
            Alert.alert("error logging in: " + error.code);
        }
      }
    } else {
      Alert.alert("enter email and password");
    }
  };
  render() {
    return (
      <KeyboardAvoidingView style={{ marginTop: 20, alignItems: "center" }}>
        <View>
          <Image
            source={require("../assets/booklogo.jpg")}
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ textAlign: "center", fontSize: 30 }}>WiLi</Text>
        </View>
        <View>
          <TextInput
            style={styles.loginBox}
            placeholder="abc@example.com"
            keyboardType="email-address"
            onChangeText={(text) => {
              this.setState({
                emailId: text,
              });
            }}
          ></TextInput>
          <TextInput
            style={styles.loginBox}
            secureTextEntry={true}
            placeholder="enter password"
            keyboardType="email-address"
            onChangeText={(text) => {
              this.setState({
                password: text,
              });
            }}
          ></TextInput>
        </View>
        <View>
          <TouchableOpacity
            style={{
              height: 30,
              width: 50,
              borderWidth: 1,
              marginTop: 20,
              paddingTop: 5,
              borderRadius: 7,
            }}
            onPress={() => {
              this.login(this.state.emailId, this.state.password);
            }}
          >
            <Text style={{ textAlign: "center" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
  },
});
