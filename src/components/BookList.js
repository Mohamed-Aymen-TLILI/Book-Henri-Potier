import React, {useState, useEffect} from "react";
import axios from 'axios';
import BookCard from "./BookCard";
import { Grid, Segment, Container } from "semantic-ui-react";
import { Form } from "semantic-ui-react";
export default function BookList(){
   
    const [books, setBooks] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    
    useEffect(() => {
      axios.get("http://henri-potier.xebia.fr/books").then((res) => {
        const list = res.data;
        setBooks(list);
      });
    }, []);

    const handleSearchInputChanges = (e) => {
      setSearchValue(e.target.value.toLowerCase());
    };


    return (
      <>
        <Container>
          <Form>
            <Form.Field>
              <input
                placeholder="Search"
                value={searchValue}
                onChange={handleSearchInputChanges}
              />
              <br />
            </Form.Field>
          </Form>
          <br />
          {books.length === 0 ? (
            <div> Loading...</div>
          ) : (
            <div>
              <Grid columns={3}>
                {books.filter((b) => {
                    return b.title.toLowerCase().includes(searchValue)
                  }).map((b) => (
                  <Grid.Column key={b.isbn} style={{ width: "20%" }}>
                    <Segment style={{ height: "100%" }}>
                      <BookCard data={b} />
                    </Segment>
                  </Grid.Column>
                ))}
              </Grid>
            </div>
          )}
        </Container>
      </>
    );
}
