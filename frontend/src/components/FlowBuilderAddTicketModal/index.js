import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

// Material-UI imports
import {
  Select,
  InputLabel,
  MenuItem,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { Stack } from "@mui/material";

// Services and utilities
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const FlowBuilderTicketModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const [activeModal, setActiveModal] = useState(false);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setQueueSelected] = useState();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();

  useEffect(() => {
    const fetchQueuesAndUsers = async () => {
      try {
        const { data: queuesData } = await api.get("/queue");
        const { data: usersData } = await api.get("/users");

        setQueues(queuesData);
        setUsers(usersData.users);

        if (open === "edit") {
          const queue = queuesData.find((item) => item.id === data.data.queue.id);
          const user = usersData.users.find((usr) => usr.id === data.data.user.id);
          if (queue) setQueueSelected(queue.id);
          if (user) setSelectedUser(user.id);
        }
        setActiveModal(true);
      } catch (error) {
        console.log(error);
        toastError(error);
      }
    };

    if (open === "edit" || open === "create") {
      fetchQueuesAndUsers();
    }

    return () => {
      isMounted.current = false;
    };
  }, [open, data]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = () => {
    if (!selectedQueue) {
      return toast.error("Adicione uma fila");
    }

    const queue = queues.find((item) => item.id === selectedQueue);
    const user = users.find((item) => item.id === selectedUser);

    if (open === "edit") {
      onUpdate({
        ...data,
        data: { queue, user },
      });
    } else if (open === "create") {
      onSave({
        queue,
        user,
      });
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog open={activeModal} onClose={handleClose} fullWidth="md" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {open === "create" ? "Adicionar uma fila ao fluxo" : "Editar fila"}
        </DialogTitle>
        <Stack>
          <DialogContent dividers>
            <Grid style={{ width: "100%", marginTop: 10 }} container>
              <Typography>Escolha a fila que deseja transferir</Typography>
              <Select
                labelId="queue-select-label"
                id="queue-select"
                value={selectedQueue}
                style={{ width: "95%" }}
                onChange={(e) => setQueueSelected(e.target.value)}
                renderValue={() => {
                  const queue = queues.find((q) => q.id === selectedQueue);
                  return queue ? queue.name : "Selecione uma Conexão";
                }}
              >
                {queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid style={{ width: "100%", marginTop: 40 }} container>
              <Typography>Escolha um atendente</Typography>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUser}
                style={{ width: "95%" }}
                onChange={(e) => setSelectedUser(e.target.value)}
                renderValue={() => {
                  const user = users.find((u) => u.id === selectedUser);
                  return user ? user.name : "Selecione um usuário";
                }}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.btnWrapper}
              onClick={handleSaveContact}
            >
              {open === "create" ? "Adicionar" : "Editar"}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderTicketModal;
