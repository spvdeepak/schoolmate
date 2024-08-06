import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Chart = ({ data, graphType: initialGraphType }) => {
  const [graphType, setGraphType] = useState(initialGraphType || 'bar');

  const lineColors = ['#FFC107', '#E91E63', '#2196F3', '#4CAF50', '#FF5722'];

  useEffect(() => {
  }, [data]);

  const renderGraph = () => {
    switch (graphType) {

      case 'bar':
        return (
          <BarChart width={650} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="section_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="student_count" fill="#4CAF50" name="Students Count" />
            <Bar dataKey="overall_performance" fill="#2196F3" name="Performance" />
          </BarChart>
        );

      case 'sinusoidal-section':
        console.log(data);
        const formattedData = data.map(student => ({
          rank: student.rank,
          studentName: student.student_name,
          overallPerformance: parseFloat(student.overall_performance)
        }));

        const CustomTooltip = ({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
              <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                <p>Name: {data.studentName}</p>
                <p>Rank: {data.rank}</p>
                <p>Overall Performance: {data.overallPerformance}</p>
              </div>
            );
          }

          return null;
        };

        return (
          <BarChart width={1100} height={400} data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rank" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="overallPerformance" fill="#8884d8" name="Overall Performance" />
          </BarChart>
        );

      case 'sinusoidal-student':
        const subjectNames = [];
        const examNames = new Set();
        data.forEach(exam => {
          const { individual_scores } = exam;
          const scoresArray = individual_scores.split(',');
          scoresArray.forEach(score => {
            const [subject] = score.split(':');
            if (!subjectNames.includes(subject.trim())) {
              subjectNames.push(subject.trim());
            }
          });
          examNames.add(exam.exam_name);
        });

        const linesData = data.map(exam => {
          const examData = { exam: exam.exam_name };
          const scoresArray = exam.individual_scores.split(',');
          scoresArray.forEach(score => {
            const [subject, value] = score.split(':');
            examData[subject.trim()] = parseInt(value.trim());
          });
          return examData;
        });

        return (
          <div>
            <h2>All Exams</h2>
            <LineChart width={1100} height={300} data={linesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" width={10} />
              <YAxis label={{ value: 'Scores', angle: -90, position: 'insideLeft', fontSize: 14, fill: 'black' }} />
              <Tooltip />
              <Legend />
              {subjectNames.map((subject, index) => (
                <Line key={index} type="monotone" dataKey={subject} name={subject} stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
              ))}
            </LineChart>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
      {renderGraph()}
    </div>
  );
};

export default Chart;
