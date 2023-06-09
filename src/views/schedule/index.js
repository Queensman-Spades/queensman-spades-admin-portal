// ** React Imports
import { Fragment, useState, useEffect, useRef } from "react"
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { useNiceLazyQuery, useNiceMutation } from "../../utility/Utils"

// ** Third Party Components
import classnames from "classnames"
import { Row, Col } from "reactstrap"

// ** Calendar App Component Imports
import Calendar from "./Calendar"
// import SidebarLeft from './SidebarLeft'
import AddEventSidebar from "./AddEventSidebar"

// ** Custom Hooks
import { useRTL } from "@hooks/useRTL"

// ** Store & Actions
import { useSelector, useDispatch } from "react-redux"
import {
  fetchEvents,
  // updateEvent,
  updateFilter,
  updateAllFilters,
  // selectEvent,
  addEvent
  // removeEvent
} from "./store/actions/index"

// ** Styles
import "@styles/react/apps/app-calendar.scss"
import { useUserDisplayName } from "@nhost/react"

// ** CalendarColors
const calendarsColor = {
  Green: "primary",
  Holiday: "success",
  Personal: "danger",
  Family: "warning",
  ETC: "info"
}

const GET_SCHEDULE = gql`
  query GetSchedule($_gte: date!, $_lte: date!) {
    scheduler(where: {date_on_calendar: {_gte: $_gte, _lte: $_lte}}) {
      id
      start: date_on_calendar
      startTime: time_on_calendar
      end: end_date_on_calendar
      endTime: end_time_on_calendar
      notes
      blocked
      worker {
        full_name
        id
        email
        teams {
          id
          team_color
        }
        teams_member {
          id
          team_color
        }
      }
      callout_id
      callout {
        status
        description
        property {
          address
          id
        }
        client_callout_email {
          email
          full_name
        }
        category
        video
        job_type
        job_type_id
        picture1
        picture2
        picture3
        picture4
      }
      job_tickets {
        name
        description
        id
        notes
        pictures
        type
        worker {
          full_name
          id
        }
      }
    }
  }
`

const UPDATE_CALLOUT = gql`
  mutation UpdateCallout(
    $notes: String
    $callout_id: Int
    $callout_by_email: String
    $category: String
    $job_type: String
    $job_type_id: Int
    $scheduler_id: Int
    $worker_id: Int
    $blocked: Boolean
    $date_on_calendar: date
    $time_on_calendar: time
    $end_date_on_calendar: date
    $end_time_on_calendar: time
    $updated_by: String
    $description: String
  ) {
    update_scheduler(
      where: { id: { _eq: $scheduler_id } }
      _set: { 
        worker_id: $worker_id, 
        blocked: $blocked, 
        date_on_calendar: $date_on_calendar
        time_on_calendar: $time_on_calendar
        end_date_on_calendar: $end_date_on_calendar
        end_time_on_calendar: $end_time_on_calendar
      }
    ) {
      affected_rows
    }
    update_callout(
      where: { id: { _eq: $callout_id } }
      _set: {
        callout_by_email: $callout_by_email
        description: $description
        category: $category
        job_type: $job_type
        job_type_id: $job_type_id
        updated_by: $updated_by
      }
    ) {
      affected_rows
    }
    update_job_worker(where: {callout_id: {_eq: $callout_id}}, _set: {worker_id: $worker_id}) {
      affected_rows
    }
  }
`

const UPDATE_CALLOUT_AND_JOB_TICKET = gql`
  mutation UpdateCalloutAndJobTicket(
    $notes: String
    $callout_id: Int
    $callout_by_email: String
    $category: String
    $job_type: String
    $job_type_id: Int
    $scheduler_id: Int
    $worker_id: Int
    $worker_email: String
    $blocked: Boolean
    $date_on_calendar: date
    $time_on_calendar: time
    $end_date_on_calendar: date
    $end_time_on_calendar: time
    $updated_by: String
    $description: String
  ) {
    update_scheduler(
      where: { id: { _eq: $scheduler_id } }
      _set: { 
        worker_id: $worker_id, 
        blocked: $blocked, 
        date_on_calendar: $date_on_calendar
        time_on_calendar: $time_on_calendar
        end_date_on_calendar: $end_date_on_calendar
        end_time_on_calendar: $end_time_on_calendar
      }
    ) {
      affected_rows
    }
    update_callout(
      where: { id: { _eq: $callout_id } }
      _set: {
        callout_by_email: $callout_by_email
        category: $category
        description: $description
        job_type: $job_type
        job_type_id: $job_type_id
        updated_by: $updated_by
      }
    ) {
      affected_rows
    }
    update_job_worker(where: {callout_id: {_eq: $callout_id}}, _set: {worker_id: $worker_id}) {
      affected_rows
    }
    update_job_tickets(where: {callout_id: {_eq: $callout_id}}, _set: {worker_email: $worker_email, worker_id: $worker_id}) {
      affected_rows
    }
  }
`


const UPDATE_CALLOUT_DRAG = gql`
mutation UpdateCalloutDrag(
  $callout_id: Int, 
  $updated_by: String, 
  $scheduler_id: Int, 
  $date_on_calendar: date, 
  $time_on_calendar: time, 
  $end_date_on_calendar: date, 
  $end_time_on_calendar: time, 
  $blocked: Boolean
  ) {
  update_scheduler(
    where: {
      id: {_eq: $scheduler_id}}, 
      _set: {
        date_on_calendar: $date_on_calendar, 
        time_on_calendar: $time_on_calendar, 
        end_date_on_calendar: $end_date_on_calendar, 
        blocked: $blocked, 
        end_time_on_calendar: $end_time_on_calendar
      }
      ) {
    affected_rows
  }
  update_callout(
      where: { id: { _eq: $callout_id } }
      _set: {updated_by: $updated_by}
    ) {
      affected_rows
    }
}

`

const DELETE_CALLOUT = gql`
  mutation DeleteCallout($callout_id: Int, $scheduler_id: Int) {
    delete_scheduler(where: { id: { _eq: $scheduler_id } }) {
      affected_rows
    }
    delete_callout(where: { id: { _eq: $callout_id } }) {
      affected_rows
    }
  }
`

const REQUEST_CALLOUT = gql`
  mutation AddCallout(
    $property_id: Int
    $date_on_calendar: date
    $end_date_on_calendar: date
    $time_on_calendar: time
    $end_time_on_calendar: time
    $notes: String
    $email: String
    $category: String
    $job_type: String
    $job_type_id: Int
    $status: String
    $picture1: String
    $picture2: String
    $picture3: String
    $picture4: String
    $urgency_level: String
    $worker_id: Int
    $inserted_by: String
    $blocked: Boolean
  ) {
    insert_scheduler_one(
      object: {
        callout: {
          data: {
            callout_by_email: $email
            property_id: $property_id
            category: $category
            job_type: $job_type
            job_type_id: $job_type_id
            status: $status
            urgency_level: $urgency_level
            picture1: $picture1
            picture2: $picture2
            picture3: $picture3
            picture4: $picture4
            active: 1
            description: $notes
            inserted_by: $inserted_by
            job_worker: {
              data: {
                worker_id: $worker_id
              }
            }
          }
        }
        date_on_calendar: $date_on_calendar
        time_on_calendar: $time_on_calendar
        end_date_on_calendar: $end_date_on_calendar
        end_time_on_calendar: $end_time_on_calendar
        notes: $notes
        worker_id: $worker_id
        blocked: $blocked
      }
    ) {
      date_on_calendar
    }
  }
`

const CalendarComponent = ({location}) => {
  const displayName = useUserDisplayName()
  // ** Variables
  // const dispatch = useDispatch()
  // const store = useSelector(state => {
  //   return state.calendar
  // })

  // ** states
  const [addSidebarOpen, setAddSidebarOpen] = useState(false),
  [leftSidebarOpen, setLeftSidebarOpen] = useState(false),
  [calendarApi, setCalendarApi] = useState(null)

  const [changeToDayView, setChangeToDayView] = useState(location?.state?.changeToDayView || false)
  const [date, setDate] = useState(location?.state?.date || false)

  const [updateCallOut] = useNiceMutation(UPDATE_CALLOUT, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    skip: !addSidebarOpen,
    refetchQueries: [
      {
        query: GET_SCHEDULE,
        variables: {
          _gte: new Date().toISOString().split("T")[0],
          _lte: new Date().toISOString().split("T")[0]
        }
      }
    ]
  })
  const [updateCalloutAndJobTicket] = useNiceMutation(UPDATE_CALLOUT_AND_JOB_TICKET, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    skip: !addSidebarOpen,
    refetchQueries: [
      {
        query: GET_SCHEDULE,
        variables: {
          _gte: new Date().toISOString().split("T")[0],
          _lte: new Date().toISOString().split("T")[0]
        }
      }
    ]
  })
  const [updateCallOutDrag] = useNiceMutation(UPDATE_CALLOUT_DRAG, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only"
  })
  const [deleteCallout] = useNiceMutation(DELETE_CALLOUT, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only"
  })

  const selectedDates = useRef({
    _gte: new Date().toISOString().split("T")[0],
    _lte: new Date().toISOString().split("T")[0]
  }) //, setSelectedDates] = useState({

  const [selectedEvent, selectEvent] = useState({})

  const _gte = selectedDates.current._gte
  const _lte = selectedDates.current._lte

  const [getSchedule, { loading, data, refetch}] = useNiceLazyQuery(GET_SCHEDULE, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    skip: !addSidebarOpen,
    variables: {
      _gte,
      _lte
    }
  })

  const updateEvent = (eventToUpdate) => {
    console.log(eventToUpdate)
    if (eventToUpdate?.extendedProps?.jobTickets?.length === 0) {
      updateCallOut({
        variables: {
          description: eventToUpdate.title,
          callout_id: eventToUpdate.callout_id,
          callout_by_email: eventToUpdate.extendedProps.clientEmail,
          category: eventToUpdate.extendedProps.category,
          job_type: eventToUpdate.extendedProps.job_type,
          job_type_id: eventToUpdate.extendedProps.job_type_id,
          scheduler_id: eventToUpdate.id,
          worker_id: eventToUpdate.extendedProps.workerId,
          // worker_email: eventToUpdate.extendedProps.workerEmail,
          blocked: eventToUpdate.extendedProps.blocked,
          time_on_calendar : eventToUpdate.startPicker.toTimeString().substr(0, 8), 
          date_on_calendar : eventToUpdate.startPicker.toLocaleDateString(),
          end_date_on_calendar: eventToUpdate.endPicker.toLocaleDateString(),
          end_time_on_calendar : eventToUpdate.endPicker.toTimeString().substr(0, 8),
          updated_by: displayName
        }
      })
    } else if (eventToUpdate?.extendedProps?.status) {
      console.log(eventToUpdate?.extendedProps?.status)
      refetch()
    } else {
      updateCalloutAndJobTicket({
        variables: {
          description: eventToUpdate.title,
          callout_id: eventToUpdate.callout_id,
          callout_by_email: eventToUpdate.extendedProps.clientEmail,
          category: eventToUpdate.extendedProps.category,
          job_type: eventToUpdate.extendedProps.job_type,
          job_type_id: eventToUpdate.extendedProps.job_type_id,
          scheduler_id: eventToUpdate.id,
          worker_id: eventToUpdate.extendedProps.workerId,
          worker_email: eventToUpdate.extendedProps.workerEmail,
          blocked: eventToUpdate.extendedProps.blocked,
          time_on_calendar : eventToUpdate.startPicker.toTimeString().substr(0, 8), 
          date_on_calendar : eventToUpdate.startPicker.toLocaleDateString(),
          end_date_on_calendar: eventToUpdate.endPicker.toLocaleDateString(),
          end_time_on_calendar : eventToUpdate.endPicker.toTimeString().substr(0, 8),
          updated_by: displayName
        }
      })
    }
  }
  const updateEventDrag = (eventToUpdate) => {
    console.log(eventToUpdate)
    updateCallOutDrag({
      variables: {
        callout_id: eventToUpdate.extendedProps.callout_id,
        date_on_calendar: eventToUpdate.startStr.split("T")[0],
        time_on_calendar: eventToUpdate.startStr.split("T")[1].substr(0, 8),
        end_date_on_calendar: eventToUpdate.endStr.split("T")[0],
        end_time_on_calendar : eventToUpdate.endStr.split("T")[1].substr(0, 8),
        blocked: eventToUpdate.extendedProps.blocked,
        scheduler_id: eventToUpdate.id,
        updated_by: displayName
      }
    })
  }

  const removeEvent = (id, callout_id) => {
    deleteCallout({
      variables: {
        callout_id,
        scheduler_id: id
      }
    })
  }


  // ** Hooks
  const [isRtl, setIsRtl] = useRTL()

  // ** AddEventSidebar Toggle Function
  const handleAddEventSidebar = () => setAddSidebarOpen(!addSidebarOpen)

  // ** LeftSidebar Toggle Function
  const toggleSidebar = (val) => setLeftSidebarOpen(val)

  // ** Blank Event Object
  const blankEvent = {
    title: "",
    start: "",
    end: "",
    allDay: false,
    url: "",
    extendedProps: {
      calendar: "",
      guests: [],
      location: "",
      description: ""
    }
  }

  const [
    requestCalloutApiCall,
    { loading: requestCalloutLoading, error: mutationError }
  ] = useNiceMutation(REQUEST_CALLOUT, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    skip: !addSidebarOpen,
    refetchQueries: [
      {
        query: GET_SCHEDULE,
        variables: {
          _gte,
          _lte
        }
      }
    ]
  })

  // ** refetchEvents
  const refetchEvents = () => {
    if (calendarApi !== null) {
      calendarApi.refetchEvents()
      // getSchedule({ variables: {
      //   _gte,
      //   _lte
      // }})
    }
  }
  // ** Fetch Events On Mount
  useEffect(() => {
    //  console.log(data)
    // dispatch(fetchEvents(store.selectedCalendars))
  }, [])

  const datesSet = (info) => {
    // console.log(info)
    selectedDates.current = {
      _gte: info.start, //new Date(info.start).toISOString().substring(0, 10),
      _lte: info.end // new Date(info.end).toISOString().substring(0, 10)
    }
    getSchedule({
      variables: {
        _gte: info.start,
        _lte: info.end
      }
    })
    // console.log(data)
  }
  // const data2 = [...data?.scheduler ?? [], data?.job_tickets ?? ]
  // console.log(data)

  return (
    <Fragment>
      <div className="app-calendar overflow-hidden border">
        <Row noGutters>
          <Col className="position-relative">
            <Calendar
              loading={loading || requestCalloutLoading}
              isRtl={isRtl}
              changeToDayView={changeToDayView}
              setChangeToDayView={setChangeToDayView}
              setDate={setDate}
              // store={store}
              date={date}
              events={data?.scheduler ?? []}
              // dispatch={dispatch}
              datesSet={datesSet}
              blankEvent={blankEvent}
              calendarApi={calendarApi}
              selectEvent={selectEvent}
              selectedEvent={selectedEvent}
              updateEvent={updateEvent}
              toggleSidebar={toggleSidebar}
              calendarsColor={calendarsColor}
              setCalendarApi={setCalendarApi}
              updateEventDrag={updateEventDrag}
              handleAddEventSidebar={handleAddEventSidebar}
            />
          </Col>
          <div
            className={classnames("body-content-overlay", {
              show: leftSidebarOpen === true
            })}
            onClick={() => toggleSidebar(false)}
          ></div>
        </Row>
      </div>
      <AddEventSidebar
        //store={store}
        addEvent={addEvent}
        // dispatch={dispatch}
        requestCalloutApiCall={requestCalloutApiCall}
        open={addSidebarOpen}
        selectedEvent={selectedEvent}
        selectEvent={selectEvent}
        updateEvent={updateEvent}
        removeEvent={removeEvent}
        calendarApi={calendarApi}
        refetchEvents={refetchEvents}
        calendarsColor={calendarsColor}
        handleAddEventSidebar={handleAddEventSidebar}
      />
    </Fragment>
  )
}

export default CalendarComponent
