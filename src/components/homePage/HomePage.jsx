import React, { useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faListUl,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const [selected, setSelected] = useState(false);
  const [listName, setListName] = useState('');
  const [error, setError] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [openModal, setOpenModal] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const navigate = useNavigate();

  const auth = localStorage.getItem('user');

  const userEmail = JSON.parse(auth).email;
  const userName = JSON.parse(auth).name;
  const words = userName.split(/\s+/);
  const firstLetters = words.map((word) => word.charAt(0)).join('');

  const addList = async () => {
    if (!listName) {
      setError(true);
      return false;
    }
    let result = await fetch('http://localhost:5000/add-list', {
      method: 'post',
      body: JSON.stringify({
        name: listName,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`,
      },
    });
    result = await result.json();
    closeModal();
    console.warn(result);
  };

  const getLists = async () => {
    await fetch('http://localhost:5000/lists', {
      headers: {
        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`,
      },
    }).then((resp) => {
      resp.json().then((data) => {
        setLists(data);
      });
    });
  };

  const addTask = async () => {
    if (selectedItem) {
      await fetch(
        `http://localhost:5000/add-task-to-list/${selectedItem._id}`,
        {
          method: 'post',
          body: JSON.stringify({
            title: taskTitle,
            notes: taskNotes,
          }),
          headers: {
            'Content-Type': 'application/json',
            authorization: `bearer ${JSON.parse(
              localStorage.getItem('token')
            )}`,
          },
        }
      ).then((resp) => {
        resp.json().then((data) => {
          setLists(data.tasks);
          closeModal();
          getTasks();
          getLists();
          setTaskTitle('');
          setTaskNotes('');
        });
      });
    }
  };

  const updateListName = async () => {
    if (selectedItem) {
      await fetch(`http://localhost:5000/lists/${selectedItem._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: listName }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
        },
      })
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`Failed to update list name (HTTP ${resp.status})`);
          }
          return resp.json();
        })
        .then(() => {
          setListName(selectedItem.name);
          getLists();
          closeModal();
        })
        .catch((error) => {
          console.error('Error updating list name:', error);
        });
    }
  };

  const deleteList = async () => {
    return fetch(`http://localhost:5000/lists/${selectedItem._id}`, {
      method: 'DELETE',
      headers: {
        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete list (HTTP ${response.status})`);
        }
        return response.json();
      })
      .then((result) => {
        if (result) {
          closeModal();
          getLists();
        }
        return result;
      })
      .catch((error) => {
        console.error('Error deleting list:', error);
        throw error;
      });
  };

  const updateTask = async () => {
    if (selectedTask) {
      await fetch(
        `http://localhost:5000/update-task/${selectedItem._id}/${selectedTask._id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: taskTitle,
            notes: taskNotes,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(
              localStorage.getItem('token')
            )}`,
          },
        }
      )
        .then(() => {
          setTaskTitle(selectedTask.title);
          setTaskNotes(selectedTask.notes);
          closeSidebar();
          getTasks();
        })
        .catch((error) => {
          console.error('Error updating task:', error);
        });
    }
  };

  const getTasks = useCallback(async () => {
    await fetch(`http://localhost:5000/tasks/${selectedItem._id}`, {
      headers: {
        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`,
      },
    }).then((resp) => {
      resp.json().then((data) => {
        setTasks(data);
      });
    });
  }, [selectedItem?._id]);

  const deleteTask = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/deleteTask/lists/${selectedItem._id}/tasks/${selectedTask._id}`,
        {
          method: 'DELETE',
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem('token')
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete task (HTTP ${response.status})`);
      }

      const result = await response.json();

      if (result) {
        closeSidebar();
        closeModal();
        getTasks();
      }

      return result;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const searchHandle = async (event) => {
    let key = event.target.value;
    if (key) {
      let result = await fetch(`http://localhost:5000/search/${key}`, {
        headers: {
          authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`,
        },
      });
      result = await result.json();
      if (result) {
        setTasks(result);
        setLists(result);
      }
    } else {
      getTasks();
      getLists();
    }
  };

  useEffect(() => {
    getLists();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setTasks(selectedItem.tasks);
      getTasks();
    }
  }, [getTasks, selectedItem]);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleStatus = () => {
    setSelected(!selected);
  };

  const handleOpenModal = (modalToOpen) => {
    setOpenModal(modalToOpen);
  };

  const closeModal = () => {
    setOpenModal('');
  };

  const selectList = (list) => {
    setSelectedItem(list);
  };

  const handleTaskStatusChange = (taskId) => {
    const updatedTasks = tasks?.map((task) => {
      if (task._id === taskId) {
        task.completed = !task.completed;
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  const filteredTasks = selected
    ? Array.isArray(tasks) && tasks.length > 0
      ? tasks.filter((task) => task.completed)
      : []
    : Array.isArray(tasks) && tasks.length > 0
    ? tasks.filter((task) => !task.completed)
    : [];

  const handleSelectedTask = (task) => {
    setTaskTitle(task?.title);
    setTaskNotes(task?.notes);
    setSelectedTask(task);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="homePageContainer">
      <div className="sidebarContainer">
        <div className="d-flex">
          <div className="contactLetters">{firstLetters}</div>
          <p className="nameText">
            {userName}
            <br />
            <span className="emailText">{userEmail}</span>
          </p>
        </div>
        <div className="searchContainer">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            style={{ color: '#9373ff' }}
          />
          <input
            type=""
            placeholder="Search"
            onChange={searchHandle}
            className="searchInput"
          />
        </div>

        <div className="d-flex justify-content-between border-bottom border-light my-3">
          <h3>Task list</h3>
          <button
            type="button"
            className="newListBtn"
            onClick={() => {
              handleOpenModal('addNewList');
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            <span>New List</span>
          </button>
        </div>

        {openModal === 'addNewList' && (
          <ReactModal
            isOpen={openModal === 'addNewList'}
            onRequestClose={closeModal}
            ariaHideApp={false}
          >
            <h4>New List</h4>
            <input
              className="customInput"
              type="text"
              placeholder="Enter list title"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            {error ? <p>The list must have a title!</p> : null}
            <div className="d-flex justify-content-end w-100">
              <button className="newListBtn" onClick={closeModal}>
                Cancel
              </button>
              <button onClick={addList} type="button" className="addListBtn">
                <FontAwesomeIcon icon={faPlus} size="lg" className="me-1" />
                Create
              </button>
            </div>
          </ReactModal>
        )}

        {lists?.length > 0 ? (
          lists?.map((list, index) => (
            <>
              <div
                className={
                  list._id === selectedItem?._id
                    ? 'selectedList'
                    : 'unselectedList'
                }
                onClick={() => selectList(list)}
                key={'task' + list.name + index}
              >
                <FontAwesomeIcon icon={faListUl} className="me-1" />
                <span className="me-auto">{list.name}</span>
                <FontAwesomeIcon
                  icon={faAngleRight}
                  style={{ color: '#adb3bd' }}
                />
              </div>
            </>
          ))
        ) : (
          <h3>No list found</h3>
        )}
        {openModal === 'renameList' && (
          <ReactModal
            isOpen={openModal === 'renameList'}
            onRequestClose={closeModal}
            ariaHideApp={false}
          >
            <h4>Rename List</h4>
            <input
              className="customInput"
              type="text"
              placeholder="Enter list title"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            {error ? <p>The list must have a title!</p> : null}
            <div className="d-flex justify-content-end w-100">
              <button className="newListBtn" onClick={closeModal}>
                Cancel
              </button>
              <button
                onClick={updateListName}
                type="button"
                className="addListBtn"
              >
                Rename
              </button>
            </div>
          </ReactModal>
        )}
        <button className="logoutBtn" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="tasksContainer">
        <div className="d-flex align-items-center px-2">
          <h3 className="me-auto">{selectedItem?.name}</h3>
          {selectedItem?.name ? (
            <>
              <FontAwesomeIcon
                onClick={() => {
                  handleOpenModal('renameList');
                }}
                icon={faPen}
                style={{ color: '#ffffff', cursor: 'pointer' }}
                className="me-3"
              />
              <FontAwesomeIcon
                onClick={() => handleOpenModal('deleteList')}
                icon={faTrash}
                style={{ color: '#ffffff', cursor: 'pointer' }}
              />
            </>
          ) : null}

          {openModal === 'deleteList' && (
            <ReactModal
              isOpen={openModal === 'deleteList'}
              onRequestClose={closeModal}
              ariaHideApp={false}
            >
              <div className="text-center w-100">
                <h4>Are you sure?</h4>
                <p className="taskNote">List will be permanently deleted</p>
                <div className="d-flex justify-content-end w-100">
                  <button className="newListBtn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    onClick={deleteList}
                    type="button"
                    className="deleteBtn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </ReactModal>
          )}
        </div>
        <div className="d-flex mb-4">
          <div
            className={!selected ? 'selectedStatus' : 'unselectedStatus'}
            onClick={toggleStatus}
          >
            To do
          </div>
          <div
            className={selected ? 'selectedStatus' : 'unselectedStatus'}
            onClick={toggleStatus}
          >
            Completed
          </div>
        </div>
        {filteredTasks?.length > 0 ? (
          filteredTasks?.map((task) => (
            <div
              className={`task ${task === selectedTask ? 'selectedTask' : ''}`}
              onClick={() => {
                handleSelectedTask(task);
                openSidebar();
              }}
              key={'task' + task.title + task._id}
            >
              <input
                className="m-3 w-auto"
                type="checkbox"
                checked={task.completed}
                onChange={() => handleTaskStatusChange(task._id)}
              />
              <p className="taskTitle">
                {task.title} <br />
                {task.notes ? (
                  <span className="taskNote">{task.notes}</span>
                ) : null}
              </p>
            </div>
          ))
        ) : (
          <h3>No tasks found</h3>
        )}

        <div className={`task-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <FontAwesomeIcon
            onClick={closeSidebar}
            icon={faXmark}
            style={{ color: '#ffffff', cursor: 'pointer' }}
            className="ms-auto"
            size="lg"
          />
          <div className="d-flex border-bottom border-light mt-2 mb-5 pb-3">
            <input
              className="m-3 w-auto"
              type="checkbox"
              checked={selectedTask?.completed}
              onChange={() => handleTaskStatusChange(selectedTask?._id)}
            />
            <input
              className="editTaskInput"
              type="text"
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </div>
          <div className="task-content">
            <textarea
              className="editTaskNote"
              placeholder="Add a note"
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
            />
            <div className="d-flex justify-content-between">
              <button
                onClick={() => handleOpenModal('deleteTask')}
                className="deleteBtn"
              >
                Delete
              </button>
              <button onClick={updateTask} className="addListBtn">
                Save
              </button>
            </div>
          </div>
        </div>
        {openModal === 'deleteTask' && (
          <ReactModal
            isOpen={openModal === 'deleteTask'}
            onRequestClose={closeModal}
            ariaHideApp={false}
          >
            <div className="text-center w-100">
              <h4>Are you sure?</h4>
              <p className="taskNote">Task will be permanently deleted</p>
              <div className="d-flex justify-content-end w-100">
                <button className="newListBtn" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  onClick={deleteTask}
                  type="button"
                  className="deleteBtn"
                >
                  Delete
                </button>
              </div>
            </div>
          </ReactModal>
        )}
        <button
          className="addTaskBtn"
          onClick={() => {
            handleOpenModal('addTask');
          }}
        >
          <FontAwesomeIcon icon={faPlus} size="lg" className="me-1" />
          Add a task
        </button>
        {openModal === 'addTask' && (
          <ReactModal
            isOpen={openModal === 'addTask'}
            onRequestClose={closeModal}
            ariaHideApp={false}
          >
            <h4>New Task</h4>
            <input
              className="customInput"
              type="text"
              placeholder="Enter task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            {error ? <p>The task must have a title!</p> : null}
            <input
              className="customInput"
              type="text"
              placeholder="Enter notes"
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
            />
            <div className="d-flex justify-content-end w-100">
              <button className="newListBtn" onClick={closeModal}>
                Cancel
              </button>
              <button onClick={addTask} type="button" className="addListBtn">
                <FontAwesomeIcon icon={faPlus} size="lg" className="me-1" />
                Create
              </button>
            </div>
          </ReactModal>
        )}
      </div>
    </div>
  );
};

export default HomePage;
