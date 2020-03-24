import React from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const TODOS_QUERY = gql`
  {
    todo {
      id
      text
      complete
    }
  }
`;

const UPDATE_QUERY = gql`
  mutation updateTodo($id: ID!, $complete: Boolean!) {
    updateTodo(id: $id, complete: $complete)
  }
`;

const REMOVE_QUERY = gql`
  mutation removeTodo($id: ID!) {
    removeTodo(id: $id)
  }
`;

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
}));

function App() {
  const classes = useStyles();

  const [checked, setChecked] = React.useState([0]);

  const { loading, error, data } = useQuery(TODOS_QUERY);
  const [remove] = useMutation(REMOVE_QUERY);
  const [updateData] = useMutation(UPDATE_QUERY);

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    updateTodo(value);
  };

  const updateTodo = todo => {
    updateData({
      variables: {
        id: todo.id,
        complete: !todo.complete
      },
      update: store => {
        const data = store.readQuery({ query: TODOS_QUERY });
        data.todo = data.todo.map(x =>
          x.id === todo.id
            ? {
                ...todo,
                complete: !todo.complete
              }
            : x
        );
        store.writeQuery({ query: TODOS_QUERY, data });
      }
    });
  };

  const removeTodo = todo => {
    remove({
      variables: { id: todo.id },
      update: store => {
        const data = store.readQuery({ query: TODOS_QUERY });
        data.todo = data.todo.filter(x => x.id !== todo.id);
        store.writeQuery({ query: TODOS_QUERY, data });
      }
    });
  };

  if (loading) return <h4>loading...</h4>;
  if (error) return <h4>error</h4>;
  if (data)
    return (
      <div className="App" style={{ display: "flex" }}>
        <div style={{ margin: "0 auto", width: "400px" }}>
          <Paper elevation={1}>
            <List className={classes.root}>
              {data.todo.map(value => {
                const labelId = `checkbox-list-label-${value}`;

                return (
                  <ListItem
                    key={value.id}
                    role={undefined}
                    dense
                    button
                    onClick={handleToggle(value)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={value.complete}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      id={labelId}
                      primary={`${value.text} ${value.id}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="comments"
                        onClick={() => removeTodo(value)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </div>
      </div>
    );
}

export default App;
