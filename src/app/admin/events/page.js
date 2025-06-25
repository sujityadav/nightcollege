'use client';
import React, { useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import TextEditor from '@/app/components/common/editor';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from 'primereact/tag';


export default function EventList() {
  const eventlist = [
    {
      id: 1,
      eventtitle: "Enterprise Infra",
      smalldescription: "META",
      largedescription: "Infrastructure upgrade for META's global data centers.",
      from: "IDC",
      to: "META",
      location: "H1 Hall",
      photos: "q1.jpg",
      type: "Historical",
       tags: ["Internal", "Urgent"]
    },
    {
      id: 2,
      eventtitle: "Cloud Migration Workshop",
      smalldescription: "AWS + Azure",
      largedescription: "Hybrid cloud strategies using AWS and Azure services.",
      from: "TechOps",
      to: "All Departments",
      location: "Room 204",
      photos: "q2.jpg",
      type: "Training",
       tags: ["Upcoming", "External"]
    },
    {
      id: 3,
      eventtitle: "AI Product Launch",
      smalldescription: "NeuraX",
      largedescription: "Launch event for NeuraX, the new AI assistant.",
      from: "R&D",
      to: "Executive Team",
      location: "Auditorium",
      photos: "launch.jpg",
      type: "Announcement",
      tags:['Completed']
    },
    {
      id: 4,
      eventtitle: "Annual Tech Summit",
      smalldescription: "Company-wide",
      largedescription: "Talks, panels, and demos from all departments.",
      from: "CTO Office",
      to: "All Staff",
      location: "Convention Center",
      photos: "summit.jpg",
      type: "Conference",
    },
    {
      id: 5,
      eventtitle: "Data Security Drill",
      smalldescription: "ISO Compliance",
      largedescription: "Simulated data breach handling exercise.",
      from: "InfoSec",
      to: "IT & Compliance",
      location: "Security Lab 1",
      photos: "security.jpg",
      type: "Simulation",
    },
    {
      id: 6,
      eventtitle: "Leadership Offsite",
      smalldescription: "Strategy Meet",
      largedescription: "Annual planning and review meeting for senior leadership.",
      from: "CEO Office",
      to: "Leadership Team",
      location: "Resort Blue",
      photos: "offsite.jpg",
      type: "Retreat",
    },
    {
      id: 7,
      eventtitle: "UX Design Sprint",
      smalldescription: "App Redesign",
      largedescription: "Week-long sprint to revamp the mobile UX.",
      from: "Design Team",
      to: "Product Team",
      location: "Design Lab",
      photos: "uxsprint.jpg",
      type: "Workshop",
    },
    {
      id: 8,
      eventtitle: "Hackathon 2025",
      smalldescription: "24 Hour Build",
      largedescription: "Internal coding challenge for developers and designers.",
      from: "Engineering",
      to: "All Teams",
      location: "Lab C",
      photos: "hackathon.jpg",
      type: "Competition",
    },
    {
      id: 9,
      eventtitle: "Finance Town Hall",
      smalldescription: "Q1 Review",
      largedescription: "Presentation of Q1 results and financial insights.",
      from: "Finance",
      to: "All Departments",
      location: "Conf Room B",
      photos: "finance.jpg",
      type: "Meeting",
    },
    {
      id: 10,
      eventtitle: "Product Demo Day",
      smalldescription: "Client Showcase",
      largedescription: "Demo of new platform features to top clients.",
      from: "Sales",
      to: "Clients",
      location: "Studio 1",
      photos: "demo.jpg",
      type: "Demo",
    },
    {
      id: 11,
      eventtitle: "CSR Drive",
      smalldescription: "Blood Donation",
      largedescription: "Organized in partnership with Red Cross Society.",
      from: "CSR Team",
      to: "All Staff",
      location: "Lobby",
      photos: "csr.jpg",
      type: "Charity",
    },
    {
      id: 12,
      eventtitle: "Policy Briefing",
      smalldescription: "HR Update",
      largedescription: "Explanation of new hybrid work policy.",
      from: "HR",
      to: "All Employees",
      location: "Online",
      photos: "policy.jpg",
      type: "Briefing",
    },
    {
      id: 13,
      eventtitle: "International Women's Day",
      smalldescription: "Panel & Celebration",
      largedescription: "Panel discussion and recognition of women leaders.",
      from: "Diversity Council",
      to: "All Staff",
      location: "Cafeteria Hall",
      photos: "womensday.jpg",
      type: "Celebration",
    },
    {
      id: 14,
      eventtitle: "Mental Health Awareness",
      smalldescription: "Well-being Session",
      largedescription: "Talk by certified counselors on stress management.",
      from: "HR Wellness",
      to: "All Departments",
      location: "Room 305",
      photos: "mentalhealth.jpg",
      type: "Health",
    },
    {
      id: 15,
      eventtitle: "TechTalk: Quantum Computing",
      smalldescription: "Guest Lecture",
      largedescription: "Session by Dr. Rayen on practical quantum applications.",
      from: "Tech Guild",
      to: "Engineering",
      location: "Lecture Hall A",
      photos: "quantum.jpg",
      type: "TechTalk",
    },
    {
      id: 16,
      eventtitle: "Intern Orientation",
      smalldescription: "Summer Batch",
      largedescription: "Welcome and induction session for new interns.",
      from: "HR",
      to: "Interns",
      location: "Training Room",
      photos: "interns.jpg",
      type: "Orientation",
    },
    {
      id: 17,
      eventtitle: "Green Office Drive",
      smalldescription: "Plant a Tree",
      largedescription: "Sustainability initiative to plant 1000 saplings.",
      from: "Green Team",
      to: "Volunteers",
      location: "Outdoor Grounds",
      photos: "green.jpg",
      type: "Environmental",
    },
    {
      id: 18,
      eventtitle: "Quarterly Awards",
      smalldescription: "Employee Recognition",
      largedescription: "Awards ceremony for outstanding contributions.",
      from: "HR",
      to: "All Staff",
      location: "Main Hall",
      photos: "awards.jpg",
      type: "Recognition",
    },
    {
      id: 19,
      eventtitle: "Compliance Training",
      smalldescription: "Mandatory",
      largedescription: "Workshop on updated data and workplace compliance policies.",
      from: "Compliance Dept",
      to: "All Employees",
      location: "Training Room 2",
      photos: "compliance.jpg",
      type: "Training",
    },
    {
      id: 20,
      eventtitle: "Eid Celebration",
      smalldescription: "Cultural Event",
      largedescription: "Office-wide Eid celebration with traditional food and music.",
      from: "Culture Club",
      to: "All Staff",
      location: "Cafeteria",
      photos: "eid.jpg",
      type: "Festival",
    }
  ];


  const actionTemplate = (product) => {
    return (
      <div className="flex  justify-center items-center gap-4 ">

        <Link href={""} className="leading-none" >
          <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]"></i>
        </Link>
        <Link href={""} className="leading-none" >            <i className="pi pi-trash text-[18px] xl:text-[0.938vw]"></i>
        </Link>
      </div>
    );
  };
  const TagsTemplate = (rowData) => {
  const tagSeverityMap = {
    Urgent: 'danger',
    Internal: 'info',
    External: 'success',
    Upcoming: 'warning',
    Completed: 'secondary'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {rowData.tags?.map((tag, index) => (
        <Tag
          key={index}
          value={tag}
          severity={tagSeverityMap[tag] || null}
          rounded
        />
      ))}
    </div>
  );
};


  return (

    <div className="grid grid-cols-1">

      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>Events</h2>
          </div>
          <div>
            <Link href='/admin/events/add-events' className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'>
              <i className='pi pi-plus text-[14px]'></i> Add Events
            </Link>
          </div>

        </div>

        <div className='bg-white border card-shadow '>
          <div className='px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                  All Events
                </div>
                <div className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                  Display 1 to 10 of 50
                </div>
              </div>


              <div className="">
                <div className="col custSearch">
                  <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText placeholder="Search" />
                  </IconField>
                </div>

                <div>

                </div>

              </div>
            </div>

          </div>
          <div className='overflow-auto'>
            <DataTable value={eventlist}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              style={{ width: "100%" }}
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows per page {first}-{last} of {totalRecords}"
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onSelectionChange={(e) => setSelectedProducts(e.value)}

            >

              <Column
                field="id"
                header="Sr.No."
                sortable
                style={{ minWidth: "3rem" }}
                alignHeader='center'
              ></Column>
              <Column
                field="eventtitle"
                header="Event Title"
                sortable
                style={{ minWidth: "12rem" }}
              ></Column>
              <Column
                field="smalldescription"
                header="Small Description"
                sortable
                style={{ minWidth: "15rem" }}
              ></Column>
              <Column
                field="largedescription"
                header="Large Description"
                sortable
                style={{ minWidth: "16rem" }}
              ></Column>
              <Column
                field="tags"
                header="Tags"
                sortable
                body={TagsTemplate}
              />
              <Column
                field="from"
                header="from (Date)"
                sortable
                style={{ minWidth: "7rem" }}
              ></Column>
              <Column
                field="to"
                header="To (Date)"
                sortable
                style={{ minWidth: "7rem" }}
              ></Column>
              <Column
                field="location"
                header="Location"
                sortable
                style={{ minWidth: "9rem" }}
              ></Column>
              <Column
                field="photos"
                header="Event Photos"
                sortable
                style={{ minWidth: "12rem" }}
              ></Column>

              <Column
                field="type"
                header="Type"
                sortable
                style={{ minWidth: "8rem" }}
              ></Column>

              <Column
                field="action"
                header="Action"
                className="action-shadow-table"
                frozen
                alignFrozen="right"
                align="center"
                body={actionTemplate}
                style={{ minWidth: "4rem", background: "#fbf7dc", zIndex: 1, boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1); " }}
              ></Column>
            </DataTable>
          </div>

        </div>
      </div>
    </div>
  );
}



