/* eslint-disable brace-style */
import classnames from 'classnames'
import Avatar from '@components/avatar'
import { TrendingUp, User, Box, DollarSign, Book, Users, Layers } from 'react-feather'
import { Card, CardHeader, CardTitle, CardBody, CardText, Row, Col, Media, Spinner } from 'reactstrap'

const StatsCard = ({ cols, apiData, error, loading}) => {

  const data = [
    {
      title: apiData?.callout?.aggregate?.count,
      subtitle: 'Callouts',
      color: 'light-primary',
      icon: <TrendingUp size={24} />
    },
    {
      title: apiData?.closed?.aggregate?.count,
      subtitle: 'Tickets Closed',
      color: 'light-info',
      icon: <Book size={24} />
    },
    {
      title: apiData?.client?.aggregate?.count,
      subtitle: 'Clients',
      color: 'light-danger',
      icon: <Users size={24} />
    },
    {
      title: apiData?.property?.aggregate?.count,
      subtitle: 'Properties Registered',
      color: 'light-success',
      icon: <Layers size={24} />
    }
  ]

  const loadingData = [
    {
      title: "",
      subtitle: 'Callouts',
      color: 'light-primary',
      icon: <TrendingUp size={24} />
    },
    {
      title: "",
      subtitle: 'Tickets Closed',
      color: 'light-info',
      icon: <User size={24} />
    },
    {
      title: "",
      subtitle: 'Clients',
      color: 'light-danger',
      icon: <Box size={24} />
    },
    {
      title: "",
      subtitle: 'Properties Registered',
      color: 'light-success',
      icon: <DollarSign size={24} />
    }
  ]

  const renderLoadingData = () => {
    return loadingData?.map((item, index) => {
      const margin = Object.keys(cols)
      return (
        <Col
          key={index}
          {...cols}
          className={classnames({
            [`mb-2 mb-${margin[0]}-0`]: index !== data.length - 1
          })}
        >
          <Media>
            <Avatar color={item.color} icon={item.icon} className='mr-2' />
            <Media className='my-auto' body>
              <h4 className='font-weight-bolder mb-0'><Spinner color="primary" size="sm" /></h4>
              <CardText className='font-small-3 mb-0'>{item.subtitle}</CardText>
            </Media>
          </Media>
        </Col>
      )
    })
  }

  const renderData = () => {
    return data?.map((item, index) => {
      const margin = Object.keys(cols)
      return (
        <Col
          key={index}
          {...cols}
          className={classnames({
            [`mb-2 mb-${margin[0]}-0`]: index !== data.length - 1
          })}
        >
          <Media>
            <Avatar color={item.color} icon={item.icon} className='mr-2' />
            <Media className='my-auto' body>
              <h4 className='mb-0'>{item.title}</h4>
              <CardText className='font-small-3 mb-0'>{item.subtitle}</CardText>
            </Media>
          </Media>
        </Col>
      )
    })
  }

  return (
    <Card className='card-statistics'>
      <CardHeader>
        <CardTitle tag='h4'>Statistics</CardTitle>
      </CardHeader>
      <CardBody className='statistics-body'>
        {error ? <Row className="justify-content-center"><p className="text-danger">Unable to load stats</p></Row> : <Row className="justify-content-center">{loading ? renderLoadingData() : renderData()}</Row>}
      </CardBody>
    </Card>
  )
}

export default StatsCard
