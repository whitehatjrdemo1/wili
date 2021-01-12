import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import db from "../config.js";
export default class SearchScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
    };
  }
  componentDidMount = async () => {
    const query = await db.collection("transaction");
    query.docs.map((doc) => {
      this.setState({
        allTransactions: [...this.state.allTransactions, doc.data()],
      });
    });
  };

  searchTransactions = async () => {
    var enteredText = text.split("");
    var text = text.toUpperCase();
    if (enteredText[0].toUpperCase() === "B") {
      const transaction = await db
        .collection("transactions")
        .where("bookId", "==", text)
        .get();
      transaction.docs.map((doc) => {
        this.setState({
          allTransactions: [...this, state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    } else if (enteredText[0].toUpperCase() === "S") {
      const transaction = await db
        .collection("transactions")
        .where("studentId", "==", text)
        .get();
      transaction.docs.map((doc) => {
        this.setState({
          allTransactions: [...this, state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }
  };
  // fetchMoreTransactions = async () => {
  //   const query = await db
  //     .collection("transactions")
  //     .startAfter(this.state.lastVisibleTransaction)
  //     .limit(10)
  //     .get();

  // };
  fetchMoreTransactions = async () => {
    var text = this.state.search.toUpperCase();
    var enteredText = text.split("");
    if (enteredText[0].toUpperCase() == "B") {
      const query = await db
        .collection("transactions")
        .where("bookId", "==", text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10)
        .get();
      query.docs.map((doc) => {
        this.setState({
          allTransactions: [...this, state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    } else if (enteredText[0].toUpperCase() == "S") {
      const query = await db
        .collection("transactions")
        .where("studentId", "==", text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10)
        .get();
      query.docs.map((doc) => {
        this.setState({
          allTransactions: [...this, state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.bar}
            placeholder={"Enter Book or Student ID"}
            onChangeText={(text) => {
              this.setState({
                search: text,
              });
            }}
          ></TextInput>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              this.searchTransactions(this.state.search);
            }}
          >
            <Text>Search</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.allTransactions}
          renderItem={(item) => {
            <View style={{ borderWidth: 2 }} key={index}>
              <Text>{"Book Id: " + transaction.bookId}</Text>
              <Text>{"Student ID: " + transaction.studentId}</Text>
              <Text>{"Transaction Type: " + transaction.transactionType}</Text>
              <Text>{"Date: " + transaction.date.toDate()}</Text>
            </View>;
          }}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        ></FlatList>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: "row",
    height: 40,
    width: "auto",
    borderWidth: 0.5,
    alignItems: "center",
    backgroundColor: "grey",
  },
  bar: {
    borderWidth: 2,
    height: 30,
    width: 300,
    paddingLeft: 10,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
  },
});
