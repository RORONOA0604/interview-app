import React, { useState, useEffect } from "react";
import { Card, Table, Modal, List, Tag, Input, Spin } from "antd";
import { supabase } from '../utils/supabaseClient';

const { Search } = Input;

export default function Interviewer() {
  const [allInterviews, setAllInterviews] = useState([]); // Stores the original data from Supabase
  const [filteredData, setFilteredData] = useState([]);   // Stores the data to be displayed (after search)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  // This hook fetches all the interview data from Supabase when the page loads
  useEffect(() => {
    async function fetchInterviews() {
      setLoading(true);
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('created_at', { ascending: false }); // Show newest first

      if (error) {
        console.error('Error fetching interviews:', error);
      } else {
        setAllInterviews(data);
        setFilteredData(data); // Initially, the filtered data is all the data
      }
      setLoading(false);
    }

    fetchInterviews();
  }, []); // The empty array [] means this effect runs only once

  // This hook filters the displayed data whenever the user types in the search bar
  useEffect(() => {
    const results = allInterviews.filter(interview =>
      (interview.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interview.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interview.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, allInterviews]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Score (/10)',
      dataIndex: 'final_score',
      key: 'score',
      sorter: (a, b) => (a.final_score || 0) - (b.final_score || 0),
      defaultSortOrder: 'descend', // Show highest scores first by default
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <a onClick={() => setSelectedInterview(record)}>View Details</a>
      ),
    },
  ];

  return (
    <>
      <Card title="Interviewer Dashboard: All Submissions">
        <Search
          placeholder="Search by name, email, or role"
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* This Modal opens to show the full details of a selected interview */}
      <Modal
        open={!!selectedInterview}
        onCancel={() => setSelectedInterview(null)}
        footer={null}
        title={`Interview Details: ${selectedInterview?.name}`}
        width={800}
      >
        {selectedInterview ? (
          <div>
            <p><strong>Role:</strong> {selectedInterview.role}</p>
            <p><strong>Final Score:</strong> {selectedInterview.final_score}/10</p>
            <p><strong>Summary:</strong> {selectedInterview.summary}</p>
            <h4 style={{ marginTop: '16px' }}>Questions & Answers:</h4>
            <List
              bordered
              dataSource={selectedInterview.interview_log}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.question}
                    description={`Answer: ${item.answer || '(No answer provided)'}`}
                  />
                  <Tag>{item.difficulty}</Tag>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Spin /> // Show a spinner if data is still loading
        )}
      </Modal>
    </>
  );
}